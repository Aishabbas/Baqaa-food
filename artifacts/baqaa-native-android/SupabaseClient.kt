package com.baqaa.analytics.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.serializer.KotlinXSerializer
import kotlinx.serialization.json.Json

object SupabaseConfig {
    // 🔑 Replace these with your actual Supabase project credentials
    // Found at: https://supabase.com/dashboard → Project Settings → API
    const val URL = "https://YOUR_PROJECT_ID.supabase.co"
    const val ANON_KEY = "YOUR_ANON_KEY_HERE"
}

val supabaseClient = createSupabaseClient(
    supabaseUrl = SupabaseConfig.URL,
    supabaseKey = SupabaseConfig.ANON_KEY
) {
    install(Postgrest)
    install(Realtime)

    defaultSerializer = KotlinXSerializer(Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    })
}
