// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ueimpskrrqnaihwedvqh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaW1wc2tycnFuYWlod2VkdnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTQwMTUsImV4cCI6MjA2NjU5MDAxNX0.1LwzwmN2TzTv0kfVbAS1aJ25EmXjQoolUcqw2SXoDMc'

export const supabase = createClient(supabaseUrl, supabaseKey)
