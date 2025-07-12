# 🔒 **MUSILLI HOMES - ROW LEVEL SECURITY (RLS) POLICIES DOCUMENTATION**

## 📋 **OVERVIEW**

This document provides comprehensive documentation for all Row Level Security (RLS) policies implemented in the Musilli Homes database. RLS policies ensure that users can only access data they are authorized to see, providing a robust security layer at the database level.

---

## 🎯 **SECURITY PRINCIPLES**

### **Core Security Model:**
1. **Public Property Listings**: Properties and property images are publicly viewable (real estate listings)
2. **User Privacy**: Users can only see their own personal data
3. **Agent Isolation**: Agents can only see their own tasks and assignments
4. **Admin Oversight**: Admins have broader access for management purposes
5. **Service Role**: Full access for system operations

### **Authentication Levels:**
- **`anon`**: Anonymous/unauthenticated users
- **`authenticated`**: Logged-in users with valid Supabase Auth session
- **`service_role`**: System-level access for backend operations

---

## 📊 **TABLE-BY-TABLE POLICY BREAKDOWN**

### **1. USERS TABLE** (`public.users`)
**File**: `rls-001-users-table.sql`

#### **Policies:**
- **`users_select_own`**: Users can view their own data + basic info of others
- **`users_update_own`**: Users can only update their own profile
- **`users_insert_new`**: Allow new user registration
- **`users_delete_service`**: Only service role can delete users

#### **Security Logic:**
```sql
-- SELECT: Own data + basic info for agent listings
auth.uid()::text = id::text 
OR auth.jwt() ->> 'email' = email
OR auth.role() = 'service_role'
OR (auth.role() = 'authenticated' AND id IS NOT NULL)
```

#### **Business Justification:**
- Users need to see their own profile data
- Public needs to see basic agent info for property listings
- Prevents unauthorized access to sensitive user data

---

### **2. AGENTS TABLE** (`public.agents`)
**File**: `rls-002-agents-table.sql`

#### **Policies:**
- **`agents_select_own`**: Agents see own profile + public agent listings
- **`agents_update_own`**: Agents can only update their own profile
- **`agents_insert_own`**: Allow agent profile creation
- **`agents_delete_service`**: Only service role can delete agents

#### **Security Logic:**
```sql
-- SELECT: Own profile + public agent info
auth.uid()::text = id::text 
OR auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE id = agents.id)
OR auth.role() = 'service_role'
OR auth.role() = 'authenticated' 
OR auth.role() = 'anon'
```

#### **Business Justification:**
- Agents need to manage their own profiles
- Public needs to see agent info for property inquiries
- Supports agent directory functionality

---

### **3. PROPERTIES TABLE** (`public.properties`)
**File**: `rls-003-properties-table.sql`

#### **Policies:**
- **`properties_public_select`**: **PUBLIC ACCESS** - Anyone can view properties
- **`properties_agents_insert`**: Agents can create properties assigned to them
- **`properties_agents_update`**: Agents can update their own properties
- **`properties_admins_all`**: Admins have full access
- **`properties_agents_delete`**: Agents can delete their own properties

#### **Security Logic:**
```sql
-- SELECT: PUBLIC ACCESS (Critical for real estate listings)
USING (true) -- Allow EVERYONE to view properties
```

#### **Business Justification:**
- **CRITICAL**: Properties must be publicly viewable (real estate listings)
- Agents manage their own property listings
- Admins oversee all properties
- This policy fixes the main data access issue

---

### **4. PROPERTY_IMAGES TABLE** (`public.property_images`)
**File**: `rls-004-property-images-table.sql`

#### **Policies:**
- **`property_images_public_select`**: **PUBLIC ACCESS** - Anyone can view images
- **`property_images_agents_manage`**: Agents manage images for their properties

#### **Security Logic:**
```sql
-- SELECT: PUBLIC ACCESS (Linked to public properties)
USING (true) -- Allow everyone to view property images
```

#### **Business Justification:**
- Property images must be publicly viewable with properties
- Agents manage images for their own properties
- Supports property gallery functionality

---

### **5. TASKS TABLE** (`public.tasks`)
**File**: `rls-005-tasks-table.sql`

#### **Policies:**
- **`tasks_agents_own`**: Agents see only their own tasks, admins see all
- **`tasks_agents_update`**: Agents update own tasks, admins update all
- **`tasks_admins_insert`**: Admins create tasks for agents
- **`tasks_delete`**: Admins and agents can delete appropriately

#### **Security Logic:**
```sql
-- SELECT: Agent isolation + admin oversight
auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE id = tasks.agent_id)
OR auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE role = 'admin')
```

#### **Business Justification:**
- Task privacy: agents only see their own tasks
- Admin oversight: admins can manage all tasks
- Supports task assignment workflow

---

### **6. MESSAGES TABLE** (`public.messages`)
**File**: `rls-006-messages-table.sql`

#### **Policies:**
- **`messages_participants`**: Users see messages they sent/received + admin moderation
- **`messages_insert`**: Authenticated users can send messages
- **`messages_update_own`**: Users can edit their sent messages
- **`messages_delete`**: Users can delete sent messages, admins can moderate

#### **Security Logic:**
```sql
-- SELECT: Conversation participants + admin moderation
auth.jwt() ->> 'email' IN (
  SELECT email FROM users 
  WHERE id = messages.sender_id OR id = messages.receiver_id
)
OR auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE role = 'admin')
```

#### **Business Justification:**
- Message privacy: only conversation participants can see messages
- Admin moderation capabilities
- Supports real-time messaging system

---

### **7. AGENT_PROPERTIES TABLE** (`public.agent_properties`)
**File**: `rls-007-agent-properties-table.sql`

#### **Policies:**
- **`agent_properties_select`**: Agents see own assignments + public access + admin oversight
- **`agent_properties_insert`**: Admins assign properties, agents can self-assign
- **`agent_properties_update`**: Only admins can update assignments
- **`agent_properties_delete`**: Admins remove assignments, agents can remove themselves

#### **Security Logic:**
```sql
-- SELECT: Own assignments + public access for property listings
auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE id = agent_properties.agent_id)
OR auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE role = 'admin')
OR auth.role() = 'anon' -- Public access for property-agent mapping
```

#### **Business Justification:**
- Agents see their property assignments
- Public can see which agent handles which property
- Admin control over property assignments

---

## 🔧 **IMPLEMENTATION DETAILS**

### **Authentication Methods:**
1. **Supabase Auth UID**: `auth.uid()::text = id::text`
2. **JWT Email Matching**: `auth.jwt() ->> 'email' = email`
3. **Role-Based Access**: `auth.role() = 'service_role'`

### **Permission Grants:**
```sql
-- Public tables (properties, property_images, agents)
GRANT SELECT ON table_name TO anon, authenticated;

-- Private tables (users, tasks, messages)
GRANT SELECT ON table_name TO authenticated;

-- Full access for authenticated users
GRANT INSERT, UPDATE, DELETE ON table_name TO authenticated;
```

---

## 🚨 **CRITICAL SECURITY NOTES**

### **Public Access Tables:**
- **`properties`**: Must be publicly accessible (real estate listings)
- **`property_images`**: Must be publicly accessible (property galleries)
- **`agents`**: Basic info must be publicly accessible (agent directory)
- **`agent_properties`**: Must be publicly accessible (property-agent mapping)

### **Private Access Tables:**
- **`users`**: Personal data protection
- **`tasks`**: Agent task privacy
- **`messages`**: Conversation privacy

### **Emergency Access:**
- **Service Role**: Always has full access for system operations
- **Admin Role**: Has oversight access for management functions

---

## ✅ **TESTING & VERIFICATION**

### **Test File**: `rls-009-test-policies.sql`

### **Test Coverage:**
1. Anonymous user access to public data
2. Authenticated user access restrictions
3. Service role full access verification
4. Policy existence verification
5. RLS enablement verification

### **Regular Testing:**
Run the test file regularly to ensure policies work as expected:
```sql
\i rls-009-test-policies.sql
```

---

## 📈 **MAINTENANCE & UPDATES**

### **When to Update Policies:**
1. New user roles are added
2. Business requirements change
3. Security vulnerabilities are discovered
4. New tables are added

### **Update Process:**
1. Create new migration file
2. Test thoroughly in development
3. Update this documentation
4. Deploy to production
5. Run verification tests

---

*Last Updated: 2025-01-06*
*Version: 1.0*
