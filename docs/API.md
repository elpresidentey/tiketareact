# LocalStorage API Documentation

This document describes the LocalStorage-based API operations used in the Ticket Management App. Since the application uses LocalStorage for data persistence instead of a traditional backend API, this documentation covers the storage operations and data structures.

## Overview

The application uses a structured approach to LocalStorage with dedicated modules for different data types:
- **Authentication Data**: User sessions and tokens
- **Ticket Data**: Ticket CRUD operations
- **Application Settings**: User preferences and configuration

## Storage Keys

All storage keys are centralized in `src/utils/localStorage.ts`:

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ticket_app_auth_token',
  USER_DATA: 'ticket_app_user_data', 
  TICKETS: 'ticket_app_tickets',
  THEME: 'ticket_app_theme'
} as const
```

## Generic Storage Operations

### `storage.getItem<T>(key: string): T | null`
Retrieves and parses an item from LocalStorage.

**Parameters:**
- `key` (string): The storage key
- `T` (generic): Expected return type

**Returns:** Parsed object of type T or null if not found/error

**Example:**
```typescript
const userData = storage.getItem<User>('ticket_app_user_data')
```

### `storage.setItem<T>(key: string, value: T): boolean`
Stores an item in LocalStorage with JSON serialization.

**Parameters:**
- `key` (string): The storage key
- `value` (T): The value to store

**Returns:** `true` if successful, `false` if error occurred

**Example:**
```typescript
const success = storage.setItem('ticket_app_user_data', userObject)
```

### `storage.removeItem(key: string): boolean`
Removes an item from LocalStorage.

**Parameters:**
- `key` (string): The storage key to remove

**Returns:** `true` if successful, `false` if error occurred

### `storage.clear(): boolean`
Clears all LocalStorage data.

**Returns:** `true` if successful, `false` if error occurred

## Authentication API

### Token Operations

#### `authStorage.getToken(): string | null`
Retrieves the current authentication token.

**Returns:** Token string or null if not authenticated

**Example:**
```typescript
const token = authStorage.getToken()
if (token) {
  // User is authenticated
}
```

#### `authStorage.setToken(token: string): boolean`
Stores an authentication token.

**Parameters:**
- `token` (string): The session token to store

**Returns:** `true` if successful, `false` if error occurred

**Token Format:**
```
session_{userId}_{timestamp}_{randomString}
```

#### `authStorage.removeToken(): boolean`
Removes the authentication token.

**Returns:** `true` if successful, `false` if error occurred

### User Data Operations

#### `authStorage.getUser(): User | null`
Retrieves the current user data.

**Returns:** User object or null if not found

**User Object Structure:**
```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
}
```

#### `authStorage.setUser(user: User): boolean`
Stores user data.

**Parameters:**
- `user` (User): The user object to store

**Returns:** `true` if successful, `false` if error occurred

#### `authStorage.removeUser(): boolean`
Removes user data from storage.

**Returns:** `true` if successful, `false` if error occurred

#### `authStorage.clearAuth(): boolean`
Clears all authentication data (token + user).

**Returns:** `true` if both operations successful, `false` otherwise

**Example:**
```typescript
// Complete logout
const success = authStorage.clearAuth()
if (success) {
  // Redirect to login page
}
```

## Ticket Management API

### Ticket Data Structure

```typescript
interface Ticket {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  tags: string[]
}
```

### Read Operations

#### `ticketStorage.getTickets(): Ticket[]`
Retrieves all tickets from storage.

**Returns:** Array of Ticket objects (empty array if none found)

**Example:**
```typescript
const tickets = ticketStorage.getTickets()
console.log(`Found ${tickets.length} tickets`)
```

#### `ticketStorage.getTicketById(ticketId: string): Ticket | null`
Retrieves a specific ticket by ID.

**Parameters:**
- `ticketId` (string): The ticket ID to find

**Returns:** Ticket object or null if not found

**Example:**
```typescript
const ticket = ticketStorage.getTicketById('ticket_123')
if (ticket) {
  console.log(`Found ticket: ${ticket.title}`)
}
```

### Write Operations

#### `ticketStorage.setTickets(tickets: Ticket[]): boolean`
Replaces all tickets in storage.

**Parameters:**
- `tickets` (Ticket[]): Array of tickets to store

**Returns:** `true` if successful, `false` if error occurred

**Example:**
```typescript
const newTickets = [...existingTickets, newTicket]
const success = ticketStorage.setTickets(newTickets)
```

#### `ticketStorage.addTicket(ticket: Ticket): boolean`
Adds a new ticket to storage.

**Parameters:**
- `ticket` (Ticket): The ticket object to add

**Returns:** `true` if successful, `false` if error occurred

**Example:**
```typescript
const newTicket: Ticket = {
  id: 'ticket_' + Date.now(),
  title: 'Fix login bug',
  status: 'open',
  priority: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['bug', 'authentication']
}

const success = ticketStorage.addTicket(newTicket)
```

#### `ticketStorage.updateTicket(ticketId: string, updates: Partial<Ticket>): boolean`
Updates an existing ticket.

**Parameters:**
- `ticketId` (string): The ID of the ticket to update
- `updates` (Partial<Ticket>): Object containing fields to update

**Returns:** `true` if successful, `false` if ticket not found or error occurred

**Example:**
```typescript
const success = ticketStorage.updateTicket('ticket_123', {
  status: 'closed',
  updatedAt: new Date()
})
```

#### `ticketStorage.deleteTicket(ticketId: string): boolean`
Deletes a ticket from storage.

**Parameters:**
- `ticketId` (string): The ID of the ticket to delete

**Returns:** `true` if successful, `false` if ticket not found or error occurred

**Example:**
```typescript
const success = ticketStorage.deleteTicket('ticket_123')
if (success) {
  console.log('Ticket deleted successfully')
}
```

#### `ticketStorage.clearTickets(): boolean`
Removes all tickets from storage.

**Returns:** `true` if successful, `false` if error occurred

## Utility Functions

### `isLocalStorageAvailable(): boolean`
Checks if LocalStorage is available in the current environment.

**Returns:** `true` if LocalStorage is available and functional, `false` otherwise

**Example:**
```typescript
if (!isLocalStorageAvailable()) {
  console.warn('LocalStorage not available, using fallback storage')
  // Implement fallback storage strategy
}
```

## Error Handling

All storage operations include comprehensive error handling:

### Common Error Scenarios
1. **Storage Quota Exceeded**: When LocalStorage is full
2. **Serialization Errors**: When objects can't be JSON serialized
3. **Browser Restrictions**: When LocalStorage is disabled
4. **Corrupted Data**: When stored data is malformed

### Error Handling Pattern
```typescript
try {
  const result = storage.setItem('key', data)
  if (!result) {
    // Handle storage failure
    console.error('Failed to save data')
  }
} catch (error) {
  console.error('Storage operation failed:', error)
  // Implement fallback strategy
}
```

## Data Migration

### Version Compatibility
The storage system includes basic data migration support:

```typescript
// Check for legacy data format
const legacyTickets = localStorage.getItem('tickets') // Old key
if (legacyTickets && !ticketStorage.getTickets().length) {
  // Migrate legacy data
  const tickets = JSON.parse(legacyTickets)
  ticketStorage.setTickets(tickets)
  localStorage.removeItem('tickets') // Clean up old data
}
```

## Performance Considerations

### Best Practices
1. **Batch Operations**: Use `setTickets()` for multiple updates
2. **Minimal Data**: Store only necessary fields
3. **Lazy Loading**: Load data only when needed
4. **Debounced Saves**: Avoid excessive write operations

### Storage Limits
- **Typical Limit**: 5-10MB per domain
- **Monitoring**: Check storage usage periodically
- **Cleanup**: Remove expired or unnecessary data

### Example: Efficient Batch Update
```typescript
// Inefficient: Multiple individual updates
tickets.forEach(ticket => {
  ticketStorage.updateTicket(ticket.id, { status: 'closed' })
})

// Efficient: Single batch update
const updatedTickets = tickets.map(ticket => ({
  ...ticket,
  status: 'closed' as const,
  updatedAt: new Date()
}))
ticketStorage.setTickets(updatedTickets)
```

## Testing

### Mock Storage for Tests
```typescript
// Test setup
const mockStorage = {
  store: new Map(),
  getItem: (key: string) => mockStorage.store.get(key) || null,
  setItem: (key: string, value: string) => mockStorage.store.set(key, value),
  removeItem: (key: string) => mockStorage.store.delete(key),
  clear: () => mockStorage.store.clear()
}

Object.defineProperty(window, 'localStorage', {
  value: mockStorage
})
```

### Test Examples
```typescript
describe('Ticket Storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve tickets', () => {
    const ticket: Ticket = {
      id: 'test-ticket',
      title: 'Test Ticket',
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }

    const success = ticketStorage.addTicket(ticket)
    expect(success).toBe(true)

    const retrieved = ticketStorage.getTicketById('test-ticket')
    expect(retrieved).toEqual(ticket)
  })
})
```

## Security Considerations

### Data Sensitivity
- **No Passwords**: Never store passwords in LocalStorage
- **Token Security**: Tokens have expiration and validation
- **Data Sanitization**: All inputs are validated before storage

### XSS Protection
- **Input Validation**: All data is validated with Zod schemas
- **Output Encoding**: Data is properly encoded when displayed
- **CSP Headers**: Content Security Policy prevents script injection

### Example: Secure Token Validation
```typescript
const isValidSessionToken = (token: string): boolean => {
  // Check format: session_{userId}_{timestamp}_{random}
  if (!token.startsWith('session_')) return false
  
  const parts = token.split('_')
  if (parts.length !== 4) return false
  
  // Check timestamp (24 hour expiry)
  const timestamp = parseInt(parts[2])
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  return (now - timestamp) <= twentyFourHours
}
```

## Future Enhancements

### Planned Improvements
1. **Encryption**: Client-side encryption for sensitive data
2. **Compression**: Data compression for large datasets
3. **Sync**: Cross-tab synchronization improvements
4. **Backup**: Export/import functionality
5. **Versioning**: Schema versioning for data migrations

### API Evolution
When transitioning to a backend API:
1. **Adapter Pattern**: Create API adapters that match storage interface
2. **Gradual Migration**: Replace storage calls with API calls incrementally
3. **Offline Support**: Keep LocalStorage as offline cache
4. **Sync Strategy**: Implement conflict resolution for offline/online sync

---

This LocalStorage API provides a robust foundation for the ticket management application while maintaining simplicity and performance. The structured approach ensures data consistency and provides a clear migration path to a traditional backend API when needed.