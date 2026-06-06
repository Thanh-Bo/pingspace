import { useForm } from "react-hook-form";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

type SignupFormData = {
  fullName: string;
  email: string;
  password: string;
};

export const SignupPage = () => {
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  // Initialize react-hook-form
  const form = useForm<SignupFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: SignupFormData) => {
    try {
      await signup(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen  ">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <CardTitle>Sign up for an account</CardTitle>
          <CardDescription>
            Enter your email below to sign up for your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => navigate("/login")}>
              Login
            </Button>
          </CardAction>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 p-2"
          >
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Nguyen Van Thanh"
                      className="h-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="xuanpq359@gmail.com"
                      className="h-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSigningUp} className="w-full h-10 text-sm">
              {isSigningUp ? "Loading..." : "Register"}
            </Button>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const id_token = credentialResponse.credential;
                if (id_token) {
                  useAuthStore.getState().loginWithGoogle(id_token);
                } else {
                  toast.error("Google login failed: No credential received");
                }
              }}
              onError={() => {
                toast.error("Google login failed");
              }}
            />
          </form>
        </Form>
      </Card>
    </div>
  );
};
