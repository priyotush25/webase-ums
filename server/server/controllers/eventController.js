import mongoose from "mongoose";

import Event from "../models/Event.js";

const TYPES = ["academic", "exam", "holiday", "event"];

const parse = (body, partial = false) => {
    const data = {};

    if (!partial || body.title !== undefined) {
        const title = String(body.title ?? "").trim();
        if (title.length < 3) return { error: "Title must be at least 3 characters" };
        data.title = title;
    }

    if (!partial || body.startDate !== undefined) {
        const start = new Date(body.startDate);
        if (Number.isNaN(start.getTime())) return { error: "A valid start date is required" };
        data.startDate = start;
    }

    if (body.endDate !== undefined) {
        if (body.endDate === "" || body.endDate === null) data.endDate = null;
        else {
            const end = new Date(body.endDate);
            if (Number.isNaN(end.getTime())) return { error: "Invalid end date" };
            data.endDate = end;
        }
    }

    if (body.type !== undefined) {
        if (!TYPES.includes(body.type)) return { error: "Invalid event type" };
        data.type = body.type;
    }

    if (body.description !== undefined) data.description = String(body.description).trim();
    if (body.location !== undefined) data.location = String(body.location).trim();

    return { data };
};

export const getEvents = async (req, res) => {
    try {
        const filter = {};

        // upcoming=true → only events that have not finished yet
        if (req.query.upcoming === "true") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filter.$or = [{ endDate: { $gte: today } }, { endDate: null, startDate: { $gte: today } }];
        }

        const events = await Event.find(filter).sort({ startDate: 1 }).limit(300);

        return res.status(200).json({ success: true, total: events.length, events });
    } catch (error) {
        console.error("Get Events Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { data, error } = parse(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        if (data.endDate && data.endDate < data.startDate) {
            return res.status(400).json({ success: false, message: "End date cannot be before start date" });
        }

        const event = await Event.create(data);

        return res.status(201).json({ success: true, message: "Event added", event });
    } catch (error) {
        console.error("Create Event Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add event" });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ success: false, message: "Invalid event ID" });
        }

        const { data, error } = parse(req.body, true);
        if (error) return res.status(400).json({ success: false, message: error });

        const event = await Event.findByIdAndUpdate(eventId, { $set: data }, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });

        return res.status(200).json({ success: true, message: "Event updated", event });
    } catch (error) {
        console.error("Update Event Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update event" });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ success: false, message: "Invalid event ID" });
        }

        const event = await Event.findByIdAndDelete(eventId);
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });

        return res.status(200).json({ success: true, message: "Event deleted" });
    } catch (error) {
        console.error("Delete Event Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete event" });
    }
};
