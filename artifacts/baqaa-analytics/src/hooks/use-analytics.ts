import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { NotificationService } from '../lib/notifications';

export interface Order {
  id: string;
  bill_number: number;
  items: any[];
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  last_order_date: string;
}

const generateMockData = () => {
  const mockCustomers: Customer[] = [
    { id: "c1", name: "Abbas Kori", phone: "9099881421", created_at: subDays(new Date(), 5).toISOString(), last_order_date: new Date().toISOString() },
    { id: "c2", name: "Fatima Shah", phone: "9876543210", created_at: subDays(new Date(), 4).toISOString(), last_order_date: subDays(new Date(), 1).toISOString() },
    { id: "c3", name: "Zaid Shaikh", phone: "9988776655", created_at: subDays(new Date(), 3).toISOString(), last_order_date: subDays(new Date(), 2).toISOString() },
  ];

  const mockOrders: Order[] = [
    {
      id: "o1",
      bill_number: 1001,
      items: [
        { id: "i1", name: "Baqaa Supreme Burger", price: 240, quantity: 2, amount: 480 },
        { id: "i2", name: "Peri Peri Cheese Fries", price: 160, quantity: 1, amount: 160 }
      ],
      subtotal: 640,
      discount_type: "percentage",
      discount_value: 10,
      discount_amount: 64,
      total: 576,
      payment_method: "Online",
      customer_name: "Abbas Kori",
      customer_phone: "9099881421",
      created_at: new Date().toISOString()
    },
    {
      id: "o2",
      bill_number: 1002,
      items: [
        { id: "i3", name: "Chicken Kurkure", price: 260, quantity: 1, amount: 260 },
        { id: "i4", name: "Irish Cold Coffee", price: 150, quantity: 2, amount: 300 }
      ],
      subtotal: 560,
      discount_type: "none",
      discount_value: 0,
      discount_amount: 0,
      total: 560,
      payment_method: "Cash",
      customer_name: "Fatima Shah",
      customer_phone: "9876543210",
      created_at: subDays(new Date(), 1).toISOString()
    },
    {
      id: "o3",
      bill_number: 1003,
      items: [
        { id: "i5", name: "Mexican Chicken Wrap", price: 180, quantity: 2, amount: 360 }
      ],
      subtotal: 360,
      discount_type: "rupees",
      discount_value: 20,
      discount_amount: 20,
      total: 340,
      payment_method: "Online",
      customer_name: "Zaid Shaikh",
      customer_phone: "9988776655",
      created_at: subDays(new Date(), 2).toISOString()
    }
  ];
  return { mockOrders, mockCustomers };
};

export function useAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const localOrdersRaw = localStorage.getItem('baqaa_orders');
      const localCustomersRaw = localStorage.getItem('baqaa_customers');
      
      let parsedOrders: Order[] = [];
      let parsedCustomers: Customer[] = [];
      
      if (localOrdersRaw) {
        try {
          const raw = JSON.parse(localOrdersRaw);
          parsedOrders = raw.map((o: any) => ({
            id: o.id,
            bill_number: o.billNumber ?? o.bill_number,
            items: o.items,
            subtotal: o.subtotal,
            discount_type: o.discountType ?? o.discount_type,
            discount_value: o.discountValue ?? o.discount_value,
            discount_amount: o.discountAmount ?? o.discount_amount,
            total: o.total,
            payment_method: o.paymentMethod ?? o.payment_method,
            customer_name: o.customerName ?? o.customer_name,
            customer_phone: o.customerPhone ?? o.customer_phone,
            created_at: o.createdAt ?? o.created_at,
          }));
        } catch (e) {
          console.error("Failed to parse local orders", e);
        }
      }
      
      if (localCustomersRaw) {
        try {
          const raw = JSON.parse(localCustomersRaw);
          parsedCustomers = raw.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            created_at: c.createdAt ?? c.created_at,
            last_order_date: c.lastOrderDate ?? c.last_order_date,
          }));
        } catch (e) {
          console.error("Failed to parse local customers", e);
        }
      }
      
      if (parsedOrders.length === 0) {
        const { mockOrders, mockCustomers } = generateMockData();
        parsedOrders = mockOrders;
        parsedCustomers = mockCustomers;
      }

      setOrders(parsedOrders);
      setCustomers(parsedCustomers);
    } catch (err: any) {
      console.error('Analytics load failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Request notification permissions
    NotificationService.requestPermissions();

    const handleStorageUpdate = (e: any) => {
      // Refresh when localStorage changes in another tab or in this tab
      if (!e.key || e.key === 'baqaa_orders' || e.key === 'baqaa_customers') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('baqaa_storage_update', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('baqaa_storage_update', handleStorageUpdate);
    };
  }, []);

  return { orders, customers, loading, error, refresh: fetchData };
}

