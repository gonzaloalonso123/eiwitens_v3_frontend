"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, error, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, show redirecting state
    if (user) {
      setIsRedirecting(true);
      // Force navigation to dashboard
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(username, password);
    setIsSubmitting(false);
  };

  if (isRedirecting) {
    return (
      <Card className="w-[500px] p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner className="h-8 w-8 text-[#00bcd4] mb-4" />
          <p className="text-center">
            Login successful! Redirecting to dashboard...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-[500px] p-6">
      <div className="mb-6 flex justify-center">
        <Image
          src="/placeholder.svg?height=60&width=240"
          alt="GierigGroeien.nl"
          width={240}
          height={60}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center">
            <span className="text-red-500 mr-1">*</span> Username:
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center">
            <span className="text-red-500 mr-1">*</span> Password:
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#00bcd4] hover:bg-[#00a5bb] px-8"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 rounded-md bg-[#fff9c4] p-3 flex items-center">
        <Image
          src="/placeholder.svg?height=30&width=30"
          alt="Info"
          width={30}
          height={30}
          className="mr-2"
        />
        <p className="text-sm">
          Take calculated risks to pave the way to wealth.
        </p>
      </div>
    </Card>
  );
}
