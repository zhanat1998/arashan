export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Users
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          coins: number;
          coupons_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          coins?: number;
          coupons_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          coins?: number;
          coupons_count?: number;
          updated_at?: string;
        };
      };

      // Shops/Sellers
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          logo: string | null;
          description: string | null;
          rating: number;
          sales_count: number;
          followers_count: number;
          products_count: number;
          is_verified: boolean;
          is_official_store: boolean;
          response_rate: number;
          response_time: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          logo?: string | null;
          description?: string | null;
          rating?: number;
          sales_count?: number;
          followers_count?: number;
          products_count?: number;
          is_verified?: boolean;
          is_official_store?: boolean;
          response_rate?: number;
          response_time?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          logo?: string | null;
          description?: string | null;
          rating?: number;
          sales_count?: number;
          followers_count?: number;
          products_count?: number;
          is_verified?: boolean;
          is_official_store?: boolean;
          response_rate?: number;
          response_time?: string | null;
          location?: string | null;
        };
      };

      // Categories
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string | null;
          image: string | null;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          image?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string | null;
          color?: string | null;
          image?: string | null;
          parent_id?: string | null;
          sort_order?: number;
        };
      };

      // Products
      products: {
        Row: {
          id: string;
          shop_id: string;
          category_id: string;
          title: string;
          description: string | null;
          price: number;
          original_price: number | null;
          images: string[];
          video_url: string | null;
          brand: string | null;
          stock: number;
          sold_count: number;
          colors: string[] | null;
          sizes: string[] | null;
          rating: number;
          review_count: number;
          views: number;
          likes: number;
          is_group_buy: boolean;
          group_buy_price: number | null;
          group_buy_min_people: number | null;
          is_flash_sale: boolean;
          flash_sale_price: number | null;
          flash_sale_ends_at: string | null;
          has_freeship: boolean;
          specifications: Json | null;
          features: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          images: string[];
          video_url?: string | null;
          brand?: string | null;
          stock?: number;
          sold_count?: number;
          colors?: string[] | null;
          sizes?: string[] | null;
          rating?: number;
          review_count?: number;
          views?: number;
          likes?: number;
          is_group_buy?: boolean;
          group_buy_price?: number | null;
          group_buy_min_people?: number | null;
          is_flash_sale?: boolean;
          flash_sale_price?: number | null;
          flash_sale_ends_at?: string | null;
          has_freeship?: boolean;
          specifications?: Json | null;
          features?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          shop_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          original_price?: number | null;
          images?: string[];
          video_url?: string | null;
          brand?: string | null;
          stock?: number;
          sold_count?: number;
          colors?: string[] | null;
          sizes?: string[] | null;
          rating?: number;
          review_count?: number;
          views?: number;
          likes?: number;
          is_group_buy?: boolean;
          group_buy_price?: number | null;
          group_buy_min_people?: number | null;
          is_flash_sale?: boolean;
          flash_sale_price?: number | null;
          flash_sale_ends_at?: string | null;
          has_freeship?: boolean;
          specifications?: Json | null;
          features?: string[] | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };

      // Group Buy Sessions
      group_buys: {
        Row: {
          id: string;
          product_id: string;
          initiator_id: string;
          current_people: number;
          required_people: number;
          group_price: number;
          status: 'active' | 'completed' | 'expired' | 'cancelled';
          expires_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          initiator_id: string;
          current_people?: number;
          required_people: number;
          group_price: number;
          status?: 'active' | 'completed' | 'expired' | 'cancelled';
          expires_at: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          current_people?: number;
          status?: 'active' | 'completed' | 'expired' | 'cancelled';
          completed_at?: string | null;
        };
      };

      // Group Buy Participants
      group_buy_participants: {
        Row: {
          id: string;
          group_buy_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_buy_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: never;
      };

      // Flash Sales
      flash_sales: {
        Row: {
          id: string;
          product_id: string;
          sale_price: number;
          original_price: number;
          stock: number;
          sold_count: number;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sale_price: number;
          original_price: number;
          stock: number;
          sold_count?: number;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          sale_price?: number;
          stock?: number;
          sold_count?: number;
          starts_at?: string;
          ends_at?: string;
          is_active?: boolean;
        };
      };

      // Orders
      orders: {
        Row: {
          id: string;
          user_id: string;
          shop_id: string;
          order_number: string;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          total_amount: number;
          discount_amount: number;
          shipping_fee: number;
          payment_method: string | null;
          payment_id: string | null;
          shipping_address: Json;
          notes: string | null;
          group_buy_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shop_id: string;
          order_number?: string;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          total_amount: number;
          discount_amount?: number;
          shipping_fee?: number;
          payment_method?: string | null;
          payment_id?: string | null;
          shipping_address: Json;
          notes?: string | null;
          group_buy_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_method?: string | null;
          payment_id?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };

      // Order Items
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          selected_color: string | null;
          selected_size: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          selected_color?: string | null;
          selected_size?: string | null;
          created_at?: string;
        };
        Update: never;
      };

      // Coupons
      coupons: {
        Row: {
          id: string;
          code: string;
          type: 'percentage' | 'fixed';
          value: number;
          min_purchase: number;
          max_discount: number | null;
          usage_limit: number | null;
          used_count: number;
          starts_at: string;
          expires_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: 'percentage' | 'fixed';
          value: number;
          min_purchase?: number;
          max_discount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string;
          expires_at: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          type?: 'percentage' | 'fixed';
          value?: number;
          min_purchase?: number;
          max_discount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string;
          expires_at?: string;
          is_active?: boolean;
        };
      };

      // User Coupons
      user_coupons: {
        Row: {
          id: string;
          user_id: string;
          coupon_id: string;
          is_used: boolean;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coupon_id: string;
          is_used?: boolean;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          is_used?: boolean;
          used_at?: string | null;
        };
      };

      // Games (Spin Wheel, Daily Check-in)
      games: {
        Row: {
          id: string;
          name: string;
          type: 'spin_wheel' | 'daily_checkin' | 'scratch_card' | 'lucky_draw';
          rewards: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'spin_wheel' | 'daily_checkin' | 'scratch_card' | 'lucky_draw';
          rewards: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          rewards?: Json;
          is_active?: boolean;
        };
      };

      // Game Plays
      game_plays: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          reward_type: string;
          reward_value: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          reward_type: string;
          reward_value: number;
          played_at?: string;
        };
        Update: never;
      };

      // Live Streams
      live_streams: {
        Row: {
          id: string;
          shop_id: string;
          host_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          stream_key: string;
          stream_url: string | null;
          playback_url: string | null;
          status: 'scheduled' | 'live' | 'ended';
          viewer_count: number;
          peak_viewers: number;
          likes_count: number;
          products: string[];
          scheduled_at: string | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          host_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          stream_key?: string;
          stream_url?: string | null;
          playback_url?: string | null;
          status?: 'scheduled' | 'live' | 'ended';
          viewer_count?: number;
          peak_viewers?: number;
          likes_count?: number;
          products?: string[];
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          stream_url?: string | null;
          playback_url?: string | null;
          status?: 'scheduled' | 'live' | 'ended';
          viewer_count?: number;
          peak_viewers?: number;
          likes_count?: number;
          products?: string[];
          started_at?: string | null;
          ended_at?: string | null;
        };
      };

      // Chat Messages
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          message_type: 'text' | 'image' | 'product' | 'order';
          metadata: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          message_type?: 'text' | 'image' | 'product' | 'order';
          metadata?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };

      // Conversations
      conversations: {
        Row: {
          id: string;
          user_id: string;
          shop_id: string;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shop_id: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          created_at?: string;
        };
        Update: {
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
        };
      };

      // Reviews
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string;
          rating: number;
          content: string | null;
          images: string[] | null;
          is_verified_purchase: boolean;
          likes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_id: string;
          rating: number;
          content?: string | null;
          images?: string[] | null;
          is_verified_purchase?: boolean;
          likes?: number;
          created_at?: string;
        };
        Update: {
          content?: string | null;
          images?: string[] | null;
          likes?: number;
        };
      };

      // Payments
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          amount: number;
          currency: string;
          method: 'mbank' | 'elsom' | 'visa' | 'mastercard' | 'balance';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          provider_id: string | null;
          provider_response: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          method: 'mbank' | 'elsom' | 'visa' | 'mastercard' | 'balance';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          provider_id?: string | null;
          provider_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          provider_id?: string | null;
          provider_response?: Json | null;
          updated_at?: string;
        };
      };

      // Videos (for feed)
      videos: {
        Row: {
          id: string;
          product_id: string;
          shop_id: string;
          video_url: string;
          thumbnail_url: string | null;
          duration: number;
          likes: number;
          comments: number;
          shares: number;
          views: number;
          is_live: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          shop_id: string;
          video_url: string;
          thumbnail_url?: string | null;
          duration?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          views?: number;
          is_live?: boolean;
          created_at?: string;
        };
        Update: {
          video_url?: string;
          thumbnail_url?: string | null;
          likes?: number;
          comments?: number;
          shares?: number;
          views?: number;
          is_live?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}