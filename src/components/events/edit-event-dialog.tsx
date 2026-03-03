"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, type CreateEventFormData } from "@/lib/validators";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/lib/types/database.types";

const CATEGORY_OPTIONS = [
  { value: "bar", label: "Bar 🍺" },
  { value: "food", label: "Food 🍕" },
  { value: "outdoor", label: "Outdoor 🌳" },
  { value: "other", label: "Other" },
] as const;

export function EditEventDialog({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      eventDate: event.event_date,
      eventTime: event.event_time,
      minAttendees: event.min_attendees,
      maxAttendees: event.max_attendees ?? undefined,
      category: event.category as CreateEventFormData["category"],
      isAnonymous: event.is_anonymous,
    },
  });

  const locationValue = useWatch({ control, name: "location" });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) reset();
  }

  const onSubmit = async (data: CreateEventFormData) => {
    setLoading(true);
    const res = await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        event_date: data.eventDate,
        event_time: data.eventTime,
        min_attendees: data.minAttendees,
        max_attendees: data.maxAttendees ?? null,
        category: data.category,
        is_anonymous: data.isAnonymous,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "Failed to update event";
      try { message = JSON.parse(text)?.error ?? message; } catch { /* empty */ }
      toast.error(message);
      setLoading(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.event(event.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events(event.workspace_id) });
    toast.success("Event updated");
    setOpen(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input id="edit-title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input id="edit-description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input id="edit-location" {...register("location")} />
            {locationValue && (
              <a
                href={`https://www.google.com/maps/search/bars+near+${encodeURIComponent(locationValue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Find bars nearby on Maps
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-eventDate">Date *</Label>
              <Input id="edit-eventDate" type="date" {...register("eventDate")} />
              {errors.eventDate && (
                <p className="text-sm text-destructive">{errors.eventDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-eventTime">Time *</Label>
              <Input id="edit-eventTime" type="time" {...register("eventTime")} />
              {errors.eventTime && (
                <p className="text-sm text-destructive">{errors.eventTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-minAttendees">Min Attendees *</Label>
              <Input
                id="edit-minAttendees"
                type="number"
                min={2}
                {...register("minAttendees", { valueAsNumber: true })}
              />
              {errors.minAttendees && (
                <p className="text-sm text-destructive">{errors.minAttendees.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxAttendees">Max Attendees</Label>
              <Input
                id="edit-maxAttendees"
                type="number"
                min={2}
                placeholder="No limit"
                {...register("maxAttendees", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="edit-isAnonymous"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("isAnonymous")}
            />
            <Label htmlFor="edit-isAnonymous" className="cursor-pointer">
              Anonymous RSVPs — attendee names hidden from others
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
