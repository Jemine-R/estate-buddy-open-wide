import { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const AddResidentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    houseNumber: "",
    occupation: "",
    numberOfResidents: "",
    rentPaidDate: "",
    rentDueDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateRentStatus = () => {
    if (!formData.rentDueDate) return null;
    
    const dueDate = new Date(formData.rentDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "Overdue", color: "bg-red-100 text-red-800", days: Math.abs(diffDays) };
    } else if (diffDays <= 7) {
      return { status: "Due Soon", color: "bg-yellow-100 text-yellow-800", days: diffDays };
    } else {
      return { status: "Paid", color: "bg-green-100 text-green-800", days: diffDays };
    }
  };

  const rentStatus = calculateRentStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.houseNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Save resident data (in a real app, this would go to a database)
    console.log("New resident data:", formData);
    
    toast({
      title: "Resident Added Successfully",
      description: `${formData.name} has been added to the system.`,
    });

    // Navigate back to residents page
    navigate("/residents");
  };

  const handleCancel = () => {
    navigate("/residents");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Residents
        </Button>
        <h1 className="text-2xl font-semibold text-black">Add New Resident</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resident Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseNumber">House/Apartment Number *</Label>
                <Input
                  id="houseNumber"
                  type="text"
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                  placeholder="e.g., A-101, B-205"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Job/Occupation</Label>
                <Input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfResidents">Number of Residents in House</Label>
                <Select value={formData.numberOfResidents} onValueChange={(value) => handleInputChange("numberOfResidents", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 person</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Rent Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentPaidDate">Last Rent Paid Date</Label>
                  <Input
                    id="rentPaidDate"
                    type="date"
                    value={formData.rentPaidDate}
                    onChange={(e) => handleInputChange("rentPaidDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentDueDate">Next Rent Due Date</Label>
                  <Input
                    id="rentDueDate"
                    type="date"
                    value={formData.rentDueDate}
                    onChange={(e) => handleInputChange("rentDueDate", e.target.value)}
                  />
                </div>
              </div>

              {rentStatus && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rent Status:</span>
                    <Badge className={rentStatus.color}>
                      {rentStatus.status}
                    </Badge>
                    {rentStatus.status === "Overdue" && (
                      <span className="text-sm text-red-600">({rentStatus.days} days overdue)</span>
                    )}
                    {rentStatus.status === "Due Soon" && (
                      <span className="text-sm text-yellow-600">(Due in {rentStatus.days} days)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                Add Resident
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};