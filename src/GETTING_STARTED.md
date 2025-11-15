# Getting Started - Procurement Management System

## Quick Start Guide

### 1. Understanding the System

This is a complete procurement management system with a **12-step approval workflow**:

Faculty → HOD → Store Officer → Purchase Officer → Principal → Payment Officer → Store Officer → HOD → Store Officer → Purchase Officer → Principal → Accountant Officer → Completed

### 2. Login Options

The system has 8 different user roles:

- **Faculty**: Create new procurement requests
- **HOD**: Review department requests (2 review stages)
- **Store Officer (SO)**: Inventory verification (3 review stages)
- **Purchase Officer (PO)**: Procurement processing (2 review stages)
- **Principal**: Executive approvals (2 review stages)
- **Payment Officer**: Financial approval
- **Accountant Officer (AO)**: Final financial review
- **Admin**: Full system access

### 3. Testing the Workflow

#### Step 1: Login as Faculty
1. Open the application
2. Select "Faculty" role
3. Enter name: "John Smith"
4. Enter department: "Computer Science"
5. Click "Login"

#### Step 2: Create a Request
1. Click "Create Request" in the sidebar
2. Fill in the form:
   - Title: "Laboratory Equipment"
   - Department: "Computer Science"
   - Course: Select "UG"
   - Category: "Equipment"
   - Order Type: Select one
   - Description: Detailed description
   - Justification: Why it's needed
3. Add items in the table:
   - Item Name: "Desktop Computer"
   - Quantity: 10
   - Amount: 50000
   - Click "+" to add
4. Optionally attach documents
5. Click "Create Request"

#### Step 3: Review as HOD
1. Logout (button at bottom of sidebar)
2. Login as "HOD"
3. Enter name: "Dr. Sarah Johnson"
4. Enter department: "Computer Science"
5. Click "Pending Approvals" in sidebar
6. Click "Review Now" on the request
7. Click "Review Request" button
8. Choose action:
   - **Approve**: Add optional comment, create signature, click "Approve & Forward"
   - **Return**: Add mandatory comment, click "Return to Previous"

#### Step 4: Continue Through Workflow
Repeat the review process for each role:
- Store Officer
- Purchase Officer
- Principal
- Payment Officer
- Store Officer (2nd time)
- HOD (2nd time)
- Store Officer (3rd time)
- Purchase Officer (2nd time)
- Principal (2nd time)
- Accountant Officer

### 4. Key Features to Test

#### E-Signature
When approving as any role:
1. Click "Review Request"
2. Click "Approve & Forward"
3. Signature modal opens automatically
4. Choose method:
   - **Draw**: Draw with mouse on canvas
   - **Upload**: Upload signature image
   - **Type**: Type your name
5. Click "Save Signature"
6. Request is approved

#### Document Attachment
When reviewing (all roles except Principal):
1. Click "Review Request"
2. Click "Attach Documents" area
3. Select files (PDF, DOC, or images)
4. Documents appear in list
5. Take action (Approve or Return)
6. Documents are attached to request

#### Comments
On any request detail page:
1. Click "Add Comment" button
2. Type your comment
3. Click "Submit Comment"
4. Comment appears in activity feed

#### Return to Previous
To send a request back:
1. Click "Review Request"
2. Add mandatory comment explaining why
3. Optionally attach documents
4. Click "Return to Previous"
5. Request moves back one step

### 5. Pre-loaded Sample Data

The system comes with 5 sample requests at different stages:

1. **Lab Equipment** - At HOD stage
2. **Chemistry Consumables** - At Store Officer stage
3. **Library Resources** - At Principal stage
4. **Furniture** - At Payment Officer stage
5. **Sports Equipment** - Completed (shows full workflow)

### 6. Viewing Request Details

On any request detail page, you can see:
- **Progress Bar**: Shows overall completion
- **Current Stage**: Highlighted in the workflow
- **Request Information**: All submitted details
- **Items Table**: With quantities and amounts
- **Documents**: All attached files
- **Comments**: All activity and decisions
- **Workflow Timeline**: Visual status of all steps
- **Signatures**: All approver signatures

### 7. Dashboard Overview

The dashboard shows:
- **Statistics**: Total, Pending, Approved, Total Amount
- **Recent Requests**: Last 5 requests
- **Quick Actions**: Create request, View all, Approvals
- **Role-specific view**: Only relevant data for your role

### 8. Theme Toggle

Switch between Light and Dark themes:
- Click the sun/moon icon in the top right header
- Theme persists across sessions
- Smooth transition animations

### 9. Search and Filter

On Request List and Approvals pages:
- Use the search bar to find requests
- Searches in title, department, and category
- Results update in real-time

### 10. Responsive Design

The system works on:
- Desktop computers
- Tablets
- Mobile phones (portrait and landscape)
- All modern browsers

## Common Scenarios

### Scenario 1: Urgent Purchase
1. Faculty creates request
2. HOD adds comment: "Urgent - needed by Friday"
3. Each approver sees comment
4. Can expedite through workflow

### Scenario 2: Request Needs Revision
1. Purchase Officer reviews request
2. Finds issue with vendor selection
3. Clicks "Return to Previous"
4. Adds comment: "Please provide alternate vendor quotes"
5. Request goes back to Principal
6. Principal can edit and resubmit

### Scenario 3: Adding Supporting Documents
1. Store Officer reviewing inventory request
2. Has stock report to attach
3. Clicks "Review Request"
4. Uploads stock report PDF
5. Approves with document attached
6. Next approver sees the document

### Scenario 4: Multiple Reviewers
1. Same role at different steps (e.g., Store Officer)
2. Each review is independent
3. Different focus at each stage:
   - 1st review: Initial inventory check
   - 2nd review: Final confirmation
   - 3rd review: Pre-purchase verification

## Troubleshooting

### Request Not Showing
- Check your role permissions
- Faculty only sees own requests
- HOD sees department requests
- Others see requests at their workflow step

### Can't Approve
- Verify request is at your workflow step
- Check if you're logged in with correct role
- Admin can approve at any step

### Signature Not Saving
- Ensure you've drawn/uploaded/typed something
- Canvas must have content
- Try different signature method

### Documents Not Uploading
- Check file size (keep under 5MB)
- Use supported formats: PDF, DOC, DOCX, Images
- Ensure stable internet connection (when backend is connected)

## Next Steps

1. **Explore Sample Requests**: Check the 5 pre-loaded requests
2. **Test Complete Flow**: Create a request and approve through all stages
3. **Try All Features**: Signatures, documents, comments, returns
4. **Test Mobile**: Open on phone/tablet
5. **Switch Themes**: Try both light and dark modes

## Need Help?

- Check WORKFLOW_README.md for detailed workflow explanation
- Review component code for implementation details
- Check API layer (/lib/api.ts) for backend integration points

## Production Deployment

When deploying to production:

1. Replace fake API calls with real backend
2. Implement authentication/authorization
3. Add email notifications
4. Set up database (PostgreSQL/MongoDB)
5. Configure file storage (S3/Azure Blob)
6. Add audit logging
7. Implement backup strategy
8. Set up monitoring and alerts

Enjoy using the Procurement Management System! 🚀
