/* eslint-disable */
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthForm from '../AuthForm';
import { useToast } from '../../hooks/use-toast';
import { rateLimiter } from '../../utils/rateLimiter';
import { supabase } from '../../integrations/supabase/supabase';

// Mock the dependencies
jest.mock('../../hooks/use-toast');
jest.mock('../../utils/rateLimiter');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock Supabase
jest.mock('../../integrations/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: 'new-user-id' }, error: null }),
      }),
    }),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL = 'https://example.com';
process.env.NEXT_PUBLIC_SUPABASE_API_KEY = 'fake-api-key';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ ip: '127.0.0.1' }),
  })
) as jest.Mock;

describe('AuthForm', () => {
  const mockOnAuthSuccess = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: jest.fn() });
    (rateLimiter.attempt as jest.Mock).mockReturnValue(true);
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(
      mockNavigate
    );
  });

  it('renders the form correctly', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);

    expect(screen.getByPlaceholderText('Username 👤')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address 📧')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Enter Chitchat !!!/i })
    ).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);

    await act(async () => {
      await userEvent.type(
        screen.getByPlaceholderText('Username 👤'),
        'testuser'
      );
      await userEvent.type(
        screen.getByPlaceholderText('Email address 📧'),
        'test@example.com'
      );
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /Enter Chitchat !!!/i })
      );
    });

    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message on failed authentication', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Auth failed')),
    });

    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);

    await act(async () => {
      await userEvent.type(
        screen.getByPlaceholderText('Username 👤'),
        'testuser'
      );
      await userEvent.type(
        screen.getByPlaceholderText('Email address 📧'),
        'test@example.com'
      );
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /Enter Chitchat !!!/i })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/An error occurred during authentication/i)
      ).toBeInTheDocument();
    });
  });
});
