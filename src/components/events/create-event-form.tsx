"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  type CreateEventFormData,
} from "@/lib/validators";
import { useCreateEvent } from "@/hooks/use-create-event";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_MIN_ATTENDEES, DEFAULT_EVENT_TIME } from "@/lib/constants";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "bar", label: "Bar 🍺" },
  { value: "food", label: "Food 🍕" },
  { value: "outdoor", label: "Outdoor 🌳" },
  { value: "other", label: "Other" },
] as const;

export function CreateEventForm() {
  const router = useRouter();
  const { activeWorkspace } = useCurrentWorkspace();
  const createEvent = useCreateEvent();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setUserId(data.id);
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      eventDate: format(new Date(), "yyyy-MM-dd"),
      eventTime: DEFAULT_EVENT_TIME,
      minAttendees: DEFAULT_MIN_ATTENDEES,
    },
  });

  const locationValue = useWatch({ control, name: "location" });

  const onSubmit = async (data: CreateEventFormData) => {
    if (!activeWorkspace || !userId) return;

    try {
      await createEvent.mutateAsync({
        workspace_id: activeWorkspace.id,
        created_by: userId,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        event_date: data.eventDate,
        event_time: data.eventTime,
        min_attendees: data.minAttendees,
        max_attendees: data.maxAttendees ?? null,
        category: data.category,
        is_anonymous: data.isAnonymous,
      });
      toast.success("Event created!");
      router.push("/feed");
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Friday drinks, lunch run, game night..."
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional details..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where?"
              {...register("location")}
            />
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
              <Label htmlFor="eventDate">Date *</Label>
              <Input
                id="eventDate"
                type="date"
                {...register("eventDate")}
              />
              {errors.eventDate && (
                <p className="text-sm text-destructive">
                  {errors.eventDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Time *</Label>
              <Input
                id="eventTime"
                type="time"
                {...register("eventTime")}
              />
              {errors.eventTime && (
                <p className="text-sm text-destructive">
                  {errors.eventTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAttendees">Min Attendees *</Label>
              <Input
                id="minAttendees"
                type="number"
                min={2}
                {...register("minAttendees", { valueAsNumber: true })}
              />
              {errors.minAttendees && (
                <p className="text-sm text-destructive">
                  {errors.minAttendees.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees</Label>
              <Input
                id="maxAttendees"
                type="number"
                min={2}
                placeholder="No limit"
                {...register("maxAttendees", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
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
              id="isAnonymous"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("isAnonymous")}
            />
            <Label htmlFor="isAnonymous" className="cursor-pointer">
              Anonymous RSVPs — attendee names hidden from others
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createEvent.isPending || !activeWorkspace}
          >
            {createEvent.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
