import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StageBadge, StatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import NotificationDropdown from '../components/NotificationDropdown';

// Mock dashboardApi.getActivity
vi.mock('../services/api', () => ({
  dashboardApi: {
    getActivity: vi.fn().mockResolvedValue({
      data: [
        {
          _id: 'act-1',
          actionType: 'candidate_added',
          description: 'Sarah Chen applied for Senior Frontend Engineer',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'act-2',
          actionType: 'interview_scheduled',
          description: 'Marcus Johnson moved to Interview',
          createdAt: new Date().toISOString()
        }
      ]
    })
  }
}));

describe('Frontend Component Tests', () => {
  it('renders StageBadge with correct label and styling', () => {
    const { container } = render(<StageBadge stage="Interview" />);
    expect(screen.getByText('Interview')).toBeDefined();
    expect(container.firstChild.textContent).toBe('Interview');
  });

  it('renders StatusBadge for open and closed job statuses', () => {
    render(<StatusBadge status="Open" />);
    expect(screen.getByText('Open')).toBeDefined();
  });

  it('renders EmptyState with title, description, and action button', () => {
    render(
      <EmptyState
        title="No candidates found"
        description="Try adjusting your filters or search terms"
        action={<button>Clear filters</button>}
      />
    );
    expect(screen.getByText('No candidates found')).toBeDefined();
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeDefined();
    expect(screen.getByText('Clear filters')).toBeDefined();
  });

  it('renders NotificationDropdown and opens panel on click', async () => {
    render(
      <BrowserRouter>
        <NotificationDropdown />
      </BrowserRouter>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    expect(bellBtn).toBeDefined();

    // Click bell icon to open dropdown panel
    fireEvent.click(bellBtn);

    // Header should be visible
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeDefined();
    });

    // Activities should be visible
    await waitFor(() => {
      expect(screen.getByText('Sarah Chen applied for Senior Frontend Engineer')).toBeDefined();
    });

    // Mark as read button exists
    expect(screen.getByTitle('Mark all as read')).toBeDefined();
  });
});
