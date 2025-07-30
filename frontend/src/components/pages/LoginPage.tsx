import { useForm } from "react-hook-form";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();
  // Initialize react-hook-form
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center  min-h-screen ">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 p-2"
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="xuanpq359@gmail.com"
                      className="h-14 text-lg md:text-xl"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-14 text-lg md:text-xl"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 text-lg md:text-xl"
            >
              {isLoggingIn ? "Loading..." : "Login"}
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
