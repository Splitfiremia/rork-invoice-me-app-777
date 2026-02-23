import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutDashboard, FileText, Receipt, Users, Settings } from 'lucide-react-native';
import { Colors } from '@/src/core/constants/colors';
import { TouchTarget } from '@/src/core/constants/spacing';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: TouchTarget.large, // Ensure proper height for touch targets
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarAccessibilityLabel: 'Main navigation tabs',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          tabBarAccessibilityLabel: 'Invoices and Estimates tab',
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
          tabBarAccessibilityLabel: 'Expenses tab',
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          tabBarAccessibilityLabel: 'Clients tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
      {/* Hide estimates tab - now accessible from Invoices screen */}
      <Tabs.Screen
        name="estimates"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
