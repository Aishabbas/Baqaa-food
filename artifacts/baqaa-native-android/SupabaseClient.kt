package com.baqaa.analytics.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.serializer.KotlinXSerializer
import kotlinx.serialization.json.Json

object SupabaseConfig {
    const val URL = "http://localhost:8080"
    const val ANON_KEY = "local_mock_key"
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
