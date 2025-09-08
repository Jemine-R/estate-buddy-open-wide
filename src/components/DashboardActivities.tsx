import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface KeyCardActivity {
  id: string;
  resident_name: string;
  card_number: string;
  status: string;
  issued_at: string;
  activity_type: 'issued' | 'lost' | 'sent';
}

interface ResidentActivity {
  id: string;
  full_name: string;
  house_number: string;
  created_at: string;
  rent_status: string;
  activity_type: 'added' | 'rent_due' | 'updated';
}

export const DashboardActivities = () => {
  const [keyCardActivities, setKeyCardActivities] = useState<KeyCardActivity[]>([]);
  const [residentActivities, setResidentActivities] = useState<ResidentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      // Get recent key card activities
      const { data: keyCards, error: keyCardsError } = await supabase
        .from('key_cards')
        .select(`
          id,
          card_number,
          status,
          issued_at,
          residents!inner(full_name)
        `)
        .is('deleted_at', null)
        .order('issued_at', { ascending: false })
        .limit(3);

      if (keyCardsError) throw keyCardsError;

      const keyCardActivitiesData = keyCards?.map(card => ({
        id: card.id,
        resident_name: (card.residents as any)?.full_name || 'Unknown',
        card_number: card.card_number,
        status: card.status,
        issued_at: card.issued_at,
        activity_type: card.status === 'LOST' ? 'lost' as const : 'issued' as const
      })) || [];

      // Get recent resident activities
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('id, full_name, house_number, created_at, rent_status')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(3);

      if (residentsError) throw residentsError;

      const residentActivitiesData = residents?.map(resident => ({
        id: resident.id,
        full_name: resident.full_name,
        house_number: resident.house_number || '',
        created_at: resident.created_at,
        rent_status: resident.rent_status || 'paid',
        activity_type: resident.rent_status === 'due' ? 'rent_due' as const : 'added' as const
      })) || [];

      setKeyCardActivities(keyCardActivitiesData);
      setResidentActivities(residentActivitiesData);

    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKeyCardActivityText = (activity: KeyCardActivity) => {
    switch (activity.activity_type) {
      case 'issued':
        return `New card ${activity.card_number} issued to ${activity.resident_name}`;
      case 'lost':
        return `Card ${activity.card_number} marked as lost`;
      case 'sent':
        return `QR code sent to ${activity.resident_name}`;
      default:
        return `Card ${activity.card_number} updated`;
    }
  };

  const getKeyCardActivityColor = (activity: KeyCardActivity) => {
    switch (activity.activity_type) {
      case 'issued':
        return 'bg-green-50';
      case 'lost':
        return 'bg-red-50';
      case 'sent':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getResidentActivityText = (activity: ResidentActivity) => {
    switch (activity.activity_type) {
      case 'added':
        return `New resident ${activity.full_name} added${activity.house_number ? ` to ${activity.house_number}` : ''}`;
      case 'rent_due':
        return `Rent due for ${activity.full_name}`;
      case 'updated':
        return `Resident ${activity.full_name} updated information`;
      default:
        return `Activity for ${activity.full_name}`;
    }
  };

  const getResidentActivityColor = (activity: ResidentActivity) => {
    switch (activity.activity_type) {
      case 'added':
        return 'bg-green-50';
      case 'rent_due':
        return 'bg-yellow-50';
      case 'updated':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Recent Key Card Activity</h3>
        <div className="space-y-3">
          {keyCardActivities.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No recent key card activities
            </div>
          ) : (
            keyCardActivities.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-3 rounded ${getKeyCardActivityColor(activity)}`}>
                <span className="text-sm">{getKeyCardActivityText(activity)}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.issued_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Resident Status Summary</h3>
        <div className="space-y-3">
          {residentActivities.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No recent resident activities
            </div>
          ) : (
            residentActivities.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-3 rounded ${getResidentActivityColor(activity)}`}>
                <span className="text-sm">{getResidentActivityText(activity)}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};