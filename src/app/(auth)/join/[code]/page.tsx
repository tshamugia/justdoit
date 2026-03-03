"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JoinByCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth_required'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function join() {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        setStatus('auth_required');
        return;
      }

      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to join workspace');
        setStatus('error');
        return;
      }
      setStatus('success');
      setTimeout(() => router.push('/feed'), 1500);
    }
    join();
  }, [code, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Join Workspace</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === 'loading' && <p className="text-muted-foreground">Joining workspace...</p>}
        {status === 'success' && <p className="text-green-600">Successfully joined! Redirecting...</p>}
        {status === 'error' && (
          <>
            <p className="text-destructive">{error || 'Failed to join workspace'}</p>
            <Button asChild><Link href="/feed">Go to Feed</Link></Button>
          </>
        )}
        {status === 'auth_required' && (
          <>
            <p className="text-muted-foreground">You need to sign in first to join this workspace.</p>
            <Button asChild><Link href={`/login?next=/join/${code}`}>Sign in</Link></Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
