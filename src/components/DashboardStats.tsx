import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    activeKeyCards: 0,
    todayAccess: 0,
    overdueRent: 0,
    weeklyGrowth: 0,
    newCardsIssued: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total residents
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

      if (residentsError) throw residentsError;

      // Get active key cards
      const { data: keyCards, error: keyCardsError } = await supabase
        .from('key_cards')
        .select('*', { count: 'exact' })
        .eq('status', 'ACTIVE')
        .is('deleted_at', null);

      if (keyCardsError) throw keyCardsError;

      // Get residents with overdue rent
      const { data: overdueData, error: overdueError } = await supabase
        .from('residents')
        .select('*', { count: 'exact' })
        .eq('rent_status', 'overdue')
        .is('deleted_at', null);

      if (overdueError) throw overdueError;

      // Get weekly growth (residents added this week)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('residents')
        .select('*', { count: 'exact' })
        .gte('created_at', weekAgo.toISOString())
        .is('deleted_at', null);

      if (weeklyError) throw weeklyError;

      // Get new cards issued this month
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      const { data: newCardsData, error: newCardsError } = await supabase
        .from('key_cards')
        .select('*', { count: 'exact' })
        .gte('issued_at', monthAgo.toISOString())
        .is('deleted_at', null);

      if (newCardsError) throw newCardsError;

      setStats({
        totalResidents: residents?.length || 0,
        activeKeyCards: keyCards?.length || 0,
        todayAccess: Math.floor(Math.random() * 100) + 50, // Mock data for now
        overdueRent: overdueData?.length || 0,
        weeklyGrowth: weeklyData?.length || 0,
        newCardsIssued: newCardsData?.length || 0
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Total Residents</div>
        <div className="text-3xl font-bold text-black mb-2">{stats.totalResidents}</div>
        <div className="text-xs text-green-600">+{stats.weeklyGrowth} this week</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Active Key Cards</div>
        <div className="text-3xl font-bold text-black mb-2">{stats.activeKeyCards}</div>
        <div className="text-xs text-blue-600">{stats.newCardsIssued} new issued</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Door Access Events</div>
        <div className="text-3xl font-bold text-black mb-2">{stats.todayAccess}</div>
        <div className="text-xs text-gray-500">Today</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-sm text-gray-500 mb-2">Rent Overdue</div>
        <div className="text-3xl font-bold text-red-600 mb-2">{stats.overdueRent}</div>
        <div className="text-xs text-red-600">Needs attention</div>
      </div>
    </div>
  );
};