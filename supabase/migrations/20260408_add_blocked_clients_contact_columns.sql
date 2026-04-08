-- Migration: Add contact fields to blocked_clients
-- Created: 2026-04-08
-- Description: Allow blocking guest clients by email and phone in addition to profile ID.

ALTER TABLE IF EXISTS blocked_clients
ADD COLUMN IF NOT EXISTS client_email character varying;

ALTER TABLE IF EXISTS blocked_clients
ADD COLUMN IF NOT EXISTS client_phone character varying;
