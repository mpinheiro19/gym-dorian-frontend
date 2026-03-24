import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';

// Mock the entire apiClient module
vi.mock('../../client', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

// Mock js-cookie (used by login/logout)
vi.mock('js-cookie', () => ({
    default: {
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

import apiClient from '../../client';

const mockPost = vi.mocked(apiClient.post);

describe('authService — forgotPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends POST to /auth/forgot-password with email', async () => {
        const mockResponse = { data: { detail: 'Reset link sent.' } };
        mockPost.mockResolvedValueOnce(mockResponse);

        const result = await authService.forgotPassword('user@example.com');

        expect(mockPost).toHaveBeenCalledOnce();
        expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
            email: 'user@example.com',
        });
        expect(result).toEqual({ detail: 'Reset link sent.' });
    });

    it('propagates API errors', async () => {
        mockPost.mockRejectedValueOnce(new Error('Network error'));

        await expect(
            authService.forgotPassword('user@example.com')
        ).rejects.toThrow('Network error');
    });
});

describe('authService — resetPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends POST to /auth/reset-password with token and new_password', async () => {
        const mockResponse = { data: { detail: 'Password updated.' } };
        mockPost.mockResolvedValueOnce(mockResponse);

        const result = await authService.resetPassword('tok123', 'NewPass@1');

        expect(mockPost).toHaveBeenCalledOnce();
        expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
            token: 'tok123',
            new_password: 'NewPass@1',
        });
        expect(result).toEqual({ detail: 'Password updated.' });
    });

    it('payload uses new_password key (snake_case) for backend compatibility', async () => {
        const mockResponse = { data: { detail: 'ok' } };
        mockPost.mockResolvedValueOnce(mockResponse);

        await authService.resetPassword('some-token', 'Secret@99');

        const [, payload] = mockPost.mock.calls[0] as [string, Record<string, string>];
        expect(payload).toHaveProperty('new_password', 'Secret@99');
        expect(payload).not.toHaveProperty('newPassword');
    });

    it('propagates API errors', async () => {
        mockPost.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(
            authService.resetPassword('bad-token', 'Pass@1')
        ).rejects.toThrow('Unauthorized');
    });
});
