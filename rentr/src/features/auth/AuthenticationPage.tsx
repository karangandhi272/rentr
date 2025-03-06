import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { SignUpData } from "@/types/auth.types";

const AuthenticationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username: string) => {
    const re = /^[a-zA-Z0-9_]{3,16}$/;
    return re.test(username);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    const isMobile = window.innerWidth <= 768;
    toast({
      title,
      description,
      variant,
      className: isMobile
        ? "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw]"
        : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!email || !validateEmail(email)) {
      showToast(
        "Invalid Email",
        "Please enter a valid email address",
        "destructive"
      );
      return;
    }

    if (!password || !validatePassword(password)) {
      showToast(
        "Invalid Password",
        "Password must be at least 6 characters long",
        "destructive"
      );
      return;
    }

    if (!isLogin) {
      if (!firstName.trim()) {
        showToast(
          "Missing First Name",
          "First name is required",
          "destructive"
        );
        return;
      }

      if (!lastName.trim()) {
        showToast("Missing Last Name", "Last name is required", "destructive");
        return;
      }

      if (!username || !validateUsername(username)) {
        showToast(
          "Invalid Username",
          "Username must be 3-16 characters, using only letters, numbers, and underscores",
          "destructive"
        );
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const signUpData: SignUpData = {
          email,
          password,
          name: `${firstName} ${lastName}`,
          role: "user",
        };

        await signUp(signUpData);
      }
      navigate("/home");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOAuthSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      showToast(
        "OAuth Error",
        error.message || "OAuth sign-in failed",
        "destructive"
      );
    }
  };

  return (
    <div>
      <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Rentr
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Simplifying property management and tenant applications with modern solutions for today's real estate needs.&rdquo;
              </p>
              <footer className="text-sm">Property Management Made Simple</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-4 lg:p-8 h-full flex items-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                {isLogin ? "Login to your account" : "Create an account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Enter your email and password below"
                  : "Enter your details to create an account"}
              </p>
            </div>
            <div className="grid gap-4">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-3">
                  {!isLogin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="firstName">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="First Name"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoCapitalize="words"
                          autoComplete="given-name"
                          className="h-9 md:h-10"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="lastName">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Last Name"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoCapitalize="words"
                          autoComplete="family-name"
                          className="h-9 md:h-10"
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="h-9 md:h-10"
                    />
                  </div>
                  {!isLogin && (
                    <div className="grid gap-1">
                      <Label className="sr-only" htmlFor="username">
                        Username
                      </Label>
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoCapitalize="none"
                        autoComplete="username"
                        className="h-9 md:h-10"
                      />
                    </div>
                  )}
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="password">
                      Password
                    </Label>
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-9 md:h-10"
                    />
                  </div>
                  <Button type="submit" className="h-9 md:h-10">
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </div>
              </form>
              <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>

              <div className="relative flex justify-center text-xs uppercase z-10">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleOAuthSignIn}
                className="h-9 md:h-10"
              >
                Sign in with Apple
              </Button>
            </div>
            <p className="px-4 text-center text-xs md:text-sm text-muted-foreground">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="underline underline-offset-4 hover:text-primary"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default AuthenticationPage;
