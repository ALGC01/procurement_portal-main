# Procurement System - Multi-Level Approval Workflow

## Complete Workflow Sequence

The procurement system implements a comprehensive 12-step approval workflow:

1. **Faculty** → Creates the procurement request
2. **HOD (1st Review)** → Department head initial approval
3. **Store Officer (1st Review)** → Inventory and stock verification
4. **Purchase Officer (1st Review)** → Procurement feasibility check
5. **Principal (1st Review)** → Major purchase authorization
6. **Payment Officer** → Financial approval and budget verification
7. **Store Officer (2nd Review)** → Final inventory confirmation
8. **HOD (2nd Review)** → Department final verification
9. **Store Officer (3rd Review)** → Pre-purchase stock check
10. **Purchase Officer (2nd Review)** → Final procurement processing
11. **Principal (Final Review)** → Executive final approval
12. **Accountant Officer** → Financial closure and completion
13. **Completed** → Request fulfilled

## User Roles

### Faculty
- Create new procurement requests
- View own requests
- Add comments to requests

### HOD (Head of Department)
- Review requests from their department
- Approve or return requests
- Two review stages: Initial (Step 2) and Final (Step 8)
- Can attach supporting documents

### SO (Store Officer)
- Verify inventory requirements
- Check stock availability
- Three review stages: Steps 3, 7, and 9
- Can attach inventory reports

### PO (Purchase Officer)
- Review procurement feasibility
- Verify quotations and vendors
- Two review stages: Steps 4 and 10
- Can attach vendor documents

### Principal
- Review major purchases
- Two approval stages: Steps 5 and 11
- Cannot attach documents (executive approval only)

### Payment Officer
- Verify financial aspects
- Approve payment processing (Step 6)
- Can attach financial documents

### AO (Accountant Officer)
- Final financial review
- Complete the procurement cycle (Step 12)
- Can attach accounting documents

### Admin
- Full system access
- Can act on behalf of any role
- System oversight and management

## Actions Available

### Approve & Forward
- Move request to next workflow step
- Optional comment
- **Requires e-signature**
- Can attach documents (except Principal)
- Triggers notification to next approver

### Return to Previous
- Send request back one step
- **Mandatory comment** explaining reason
- Can attach supporting documents
- Returns to previous role in workflow

### Add Comment
- Add notes without changing workflow state
- Available to all users
- Visible in request history

## E-Signature Options

When approving a request, users can create signatures using:

1. **Draw** - Draw signature using mouse/touch
2. **Upload** - Upload signature image file
3. **Type** - Type full name (formatted as signature)

Signatures are:
- Required for all approvals
- Stored with timestamp and user details
- Displayed in request history
- Cannot be modified after submission

## Document Attachments

- All roles except Principal can attach documents
- Supported formats: PDF, DOC, DOCX, Images
- Documents can be attached during approval/return actions
- Each document tagged with uploader and timestamp
- Visible to all subsequent approvers

## Request Detail Page

The request detail page shows:

### Top Section
- **Workflow Progress Bar** - Visual progress indicator
- **Current Stage** - Active workflow step
- **Completion Percentage** - Overall progress

### Main Content
- Request information (title, department, category, etc.)
- Item breakdown with quantities and amounts
- Total amount calculation
- Attached documents with download links
- Description and justification

### Workflow Timeline (Sidebar)
- All 12 workflow steps
- Completed steps with checkmarks
- Current step highlighted
- Pending steps grayed out
- Approval timestamps and usernames

### Comments & Activity
- All comments in chronological order
- Action badges (Approved, Returned, Comment)
- User name and role
- Timestamps

### Signatures Section
- All signatures from approvers
- Visual display of drawn/uploaded signatures
- Typed signatures in stylized font
- Signer name and designation
- Signature timestamp

## API Integration Points

The system uses a fake API layer (`/lib/api.ts`) that currently interfaces with IndexedDB. Each function has clear TODO comments marking where real HTTP calls should be made:

```typescript
// Example integration point
export const approveRequest = async (requestId: string, action: WorkflowAction) => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/${requestId}/approve`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(action)
  // });
  // return await response.json();
  
  // Current: Fake implementation using IndexedDB
  ...
};
```

### API Endpoints to Implement

1. `POST /api/requests` - Create new request
2. `GET /api/requests` - Fetch all requests (filtered by role)
3. `GET /api/requests/:id` - Get single request
4. `GET /api/requests/pending/:step` - Get pending approvals
5. `POST /api/requests/:id/approve` - Approve and forward
6. `POST /api/requests/:id/return` - Return to previous
7. `POST /api/requests/:id/comments` - Add comment
8. `POST /api/signatures` - Save signature
9. `GET /api/signatures/user/:userId` - Get user signatures
10. `POST /api/documents/upload` - Upload document

## Features

### Smooth Animations
- Framer Motion used throughout
- Status changes animated
- Progress bar transitions
- Modal slide-ins
- List item stagger effects

### Theme Support
- Light blue theme
- Dark blue theme
- Smooth theme transitions
- Theme toggle in header

### Responsive Design
- Mobile-friendly layouts
- Adaptive grid systems
- Touch-optimized interactions
- Responsive tables and cards

### Production-Grade UI
- Large rounded corners (rounded-2xl)
- Soft shadows
- Smooth transitions
- Micro-interactions
- Loading states
- Error handling
- Toast notifications

## Testing the Workflow

1. **Login as Faculty** - Create a new request
2. **Login as HOD** - Approve the request
3. **Login as SO** - Verify inventory
4. **Login as PO** - Review procurement
5. **Login as Principal** - Authorize purchase
6. **Continue through all steps** to see complete workflow

The system comes pre-populated with 5 sample requests at different workflow stages for testing.

## File Structure

```
/lib
  - workflowTypes.ts     # Workflow configuration and utilities
  - newDb.ts             # Database schema and operations
  - api.ts               # API layer with integration placeholders
  - newMockData.ts       # Sample data for testing

/components
  /signature
    - SignatureModal.tsx # E-signature creation interface
  /modals
    - WorkflowActionModal.tsx  # Approve/Return modal
    - CommentModal.tsx         # Comment addition
  /procurement
    - NewRequestForm.tsx       # Request creation
    - NewRequestList.tsx       # Request listing
    - NewRequestDetail.tsx     # Request detail with workflow
```

## Next Steps for Production

1. **Backend Integration**
   - Replace fake API calls with real HTTP requests
   - Implement authentication tokens
   - Add request/response validation
   - Implement error handling

2. **Email Notifications**
   - Send notifications when request advances
   - Alert users of pending approvals
   - Reminder emails for stalled requests

3. **Audit Trail**
   - Comprehensive logging of all actions
   - Immutable history records
   - Compliance reporting

4. **Advanced Features**
   - Bulk approval capabilities
   - Request templates
   - Budget tracking
   - Vendor management
   - Purchase order generation
   - Invoice reconciliation

5. **Security Enhancements**
   - Role-based permissions
   - IP whitelisting
   - Session management
   - Secure document storage
   - Signature verification
