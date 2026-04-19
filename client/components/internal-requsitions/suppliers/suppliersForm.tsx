"use client";
import React, { useState } from "react";
import { inventoryAPI } from "@/lib/inventoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Loader2 } from "lucide-react";

function SuppliersForm() {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        name: supplier.name,
        contactInfo: {
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
        },
      };
      await inventoryAPI.addSupplier(payload);

      // Reset form on success
      setSupplier({
        name: "",
        email: "",
        phone: "",
        address: "",
      });

      // Optional: Add toast notification here
      // toast.success("Supplier added successfully");
    } catch (error) {
      console.error("Error adding supplier:", error);
      setError("Failed to add supplier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full  mx-auto">
      <CardHeader>
        <CardTitle>Add New Supplier</CardTitle>
        <CardDescription>
          Enter the supplier details below to add them to your inventory system.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Supplier Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Syscodes Corporation"
              value={supplier.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@gmail.com"
              value={supplier.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 8167 8900"
              value={supplier.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Ikeja......."
              value={supplier.address}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Supplier...
              </>
            ) : (
              "Add Supplier"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSupplier({
                name: "",
                email: "",
                phone: "",
                address: "",
              });
              setError("");
            }}
            disabled={isSubmitting}
            className="flex-1"
          >
            Clear
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default SuppliersForm;
