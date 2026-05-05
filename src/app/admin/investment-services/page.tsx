
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
// import { investmentPlans as initialInvestmentPlans, type InvestmentPlan } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/api";

interface InvestmentPlan {
  id: string;
  offerer: string;
  type: string;
  roi: string;
  minAmt: string;
  maxAmt: string;
  duration: string;
  riskLevel: "Low" | "Medium" | "High";
  features: string[];
  status: "Active" | "Paused";
}

export default function InvestmentServicesPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<InvestmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invplan`
        );

        if (!res) return;

        const data = await res.json();

        // Only show active plans
        // const activePlans = data.filter(
        //   (plan: InvestmentPlan) => plan.status === "Active"
        // );

        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch investment plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Loading investment...</p>;
  }


  const handleAddNew = () => {
    setCurrentPlan({
      id: `new-${Date.now()}`,
      offerer: "",
      type: "",
      roi: "",
      minAmt: "",
      maxAmt: "",
      duration: "",
      riskLevel: "Low",
      features: [],
      status: "Active"
    });
    setIsEditDialogOpen(true);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (plan: InvestmentPlan) => {
    setCurrentPlan({ ...plan, features: plan.features || [] });
    setIsEditDialogOpen(true);
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    // setPlans(plans.filter(p => p.id !== id));
    toast({
      variant: "destructive",
      title: "Delete Function not working",
      description: "Try Again after function starts working.",
      duration: 1500,
    });
  };

  const handleSave = async () => {
    if (!currentPlan) return;

    const { id, offerer, type, roi, minAmt, maxAmt } = currentPlan;
    if (!offerer || !type || !roi || !minAmt || !maxAmt) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields.",
        duration: 1500,
      });
      return;
    }

    try {
      let res;
      if (isAddDialogOpen) {
        res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/invest`, {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify(currentPlan),
        });
      } else {
        res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gateways/invest/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify(currentPlan),
        });
      }

      if (!res) throw new Error("No response");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }


      // Update UI with backend response
      if (isAddDialogOpen) {
        setPlans((prev) => [data, ...prev]);
        toast({
          variant: "success",
          title: "Offer Added",
          description: data.message || "Investment plan created successfully",
          duration: 1500,
        });
      } else {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? data : p))
        );
        toast({
          variant: "success",
          title: "Offer Updated",
          description: data.message || "Investment plan updated successfully",
          duration: 1500,
        });
      }

      setIsEditDialogOpen(false);
      setCurrentPlan(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save investment plan",
        duration: 1500,
      });
    }
  };

  const handleFeatureChange = (featuresString: string) => {
    if (currentPlan) {
      setCurrentPlan({ ...currentPlan, features: featuresString.split('\n') });
    }
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="order-2 md:order-1">
            <CardTitle>Investment Services</CardTitle>
            <CardDescription>Configure investment plans and offerings.</CardDescription>
          </div>
          <div className="order-1 flex w-full justify-end md:order-2 md:w-auto">
            <Button onClick={handleAddNew} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add New Offer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-start justify-between rounded-lg border p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary">{plan.offerer}</p>
                <div className="flex items-center gap-5">
                  <p className="font-medium">{plan.type}</p>
                  <Badge className="m-2">{plan.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">ROI: <span className="font-semibold text-accent">{plan.roi} </span>  | MinAmt: <span className="font-semibold text-accent">{plan.minAmt}</span> - MaxAmt: <span className="font-semibold text-accent">{plan.maxAmt}</span></p>
                <p className="text-sm text-muted-foreground mt-1"> Duration: <span className="font-semibold text-accent">{plan.duration}</span> | RiskLevel: <span className="font-semibold text-accent">{plan.riskLevel}</span></p>
                <ul className="list-disc list-inside text-xs text-muted-foreground mt-2">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="icon" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this investment offer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(plan.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No investment offers configured.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-2 bg-background">
            <DialogTitle>{isAddDialogOpen ? 'Add New' : 'Edit'} Investment Offer</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen ? 'Create a new investment plan for users.' : 'Update the details for this investment plan.'}
            </DialogDescription>
          </DialogHeader>
          {currentPlan && (
            <div className="flex-1 overflow-y-auto py-4 px-4">

              {/* Offerer */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Offerer</Label>
                <Input
                  value={currentPlan.offerer}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, offerer: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {/* Type */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Type</Label>
                <Input
                  value={currentPlan.type}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, type: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {/* ROI */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">ROI</Label>
                <Input
                  value={currentPlan.roi}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, roi: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {/* ROI Text */}
              {/* <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">ROI Text</Label>
                <Input
                  value={currentPlan.roiText || ""}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, roiText: e.target.value })}
                  className="col-span-3"
                />
              </div> */}

              {/* Min Amount */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Min Amt</Label>
                <Input
                  type="number"
                  value={currentPlan.minAmt}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, minAmt: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {/* Max Amount */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Max Amt</Label>
                <Input
                  type="number"
                  value={currentPlan.maxAmt}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, maxAmt: e.target.value })}
                  className="col-span-3"
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Duration (days)</Label>
                <Input
                  type="number"
                  value={currentPlan.duration}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value })}
                  className="bg-background col-span-3"
                />
              </div>

              {/* Risk Level */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Risk</Label>
                <select
                  value={currentPlan.riskLevel}
                  onChange={(e) =>
                    setCurrentPlan({ ...currentPlan, riskLevel: e.target.value as "Low" | "Medium" | "High" })
                  }
                  className="bg-background col-span-3 border rounded-md p-2"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label className="text-right">Status</Label>
                <select
                  value={currentPlan.status}
                  onChange={(e) =>
                    setCurrentPlan({ ...currentPlan, status: e.target.value as "Active" | "Paused" })
                  }
                  className="bg-background col-span-3 border rounded-md p-2"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              {/* Features */}
              <div className="grid grid-cols-4 items-start gap-4 mb-3">
                <Label className="text-right pt-2">Features</Label>
                <Textarea
                  value={currentPlan.features.join("\n")}
                  onChange={(e) => handleFeatureChange(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter each feature on a new line"
                />
              </div>

            </div>
          )}
          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
