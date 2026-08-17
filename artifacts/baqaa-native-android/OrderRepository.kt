package com.baqaa.analytics.data

import com.baqaa.analytics.data.models.Order
import com.baqaa.analytics.data.models.Customer
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order as SortOrder

object OrderRepository {

    private const val PAGE_SIZE = 1000 // Supabase max per request

    /**
     * Fetches ALL orders from Supabase, bypassing the default 1000-row limit
     * by automatically paginating through every page until no more data is returned.
     */
    suspend fun fetchAllOrders(): List<Order> {
        val allOrders = mutableListOf<Order>()
        var page = 0

        while (true) {
            val from = page * PAGE_SIZE
            val to = from + PAGE_SIZE - 1

            val result = supabaseClient
                .from("orders")
                .select {
                    order("created_at", SortOrder.DESCENDING)
                    range(from.toLong(), to.toLong())
                }
                .decodeList<Order>()

            allOrders.addAll(result)

            // If we got fewer rows than the page size, we've reached the last page
            if (result.size < PAGE_SIZE) break

            page++
        }

        return allOrders
    }

    /**
     * Fetches ALL customers from Supabase with the same pagination approach.
     */
    suspend fun fetchAllCustomers(): List<Customer> {
        val allCustomers = mutableListOf<Customer>()
        var page = 0

        while (true) {
            val from = page * PAGE_SIZE
            val to = from + PAGE_SIZE - 1

            val result = supabaseClient
                .from("customers")
                .select {
                    order("created_at", SortOrder.DESCENDING)
                    range(from.toLong(), to.toLong())
                }
                .decodeList<Customer>()

            allCustomers.addAll(result)

            if (result.size < PAGE_SIZE) break

            page++
        }

        return allCustomers
    }
}
