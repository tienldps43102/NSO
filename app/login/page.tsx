"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

const loginSchema = z.object({
    email: z.email({ message: "Email không hợp lệ" }),
    password: z.string().regex(
        /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
        {
            message: "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái và số",
        }
    ),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const searchParams = useSearchParams()
    const callbackURL = searchParams.get("callbackURL") || "/"
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const handleSubmit = async (data: LoginFormData) => {
        const res = await authClient.signIn.email({
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe,
            callbackURL: callbackURL,

        })
        if (res.error?.code === "INVALID_EMAIL_OR_PASSWORD") {
            form.setError("email", {
                type: "manual",
                message: "Email hoặc mật khẩu không đúng",
            });
            form.setError("password", {
                type: "manual",
                message: "Email hoặc mật khẩu không đúng",
            });
        }
    };

    const handleGoogleLogin = () => {
        authClient.signIn.social({
            callbackURL: callbackURL,
            provider: "google",
        });
    };

    return (
        <div className="min-h-[80vh] bg-background flex justify-center items-center">
            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center ">
                <div className="w-full max-w-md">

                    <div className="bg-card/70 backdrop-blur-xl border border-border/40 rounded-3xl p-8 shadow-glass">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Đăng nhập</h2>
                            <p className="text-muted-foreground">
                                Chào mừng bạn quay trở lại!
                            </p>
                        </div>

                        {/* Google Login Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 rounded-xl mb-6 bg-background/60 backdrop-blur-md border-border/40 hover:bg-accent/60"
                            onClick={handleGoogleLogin}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Tiếp tục với Google
                        </Button>

                        <div className="relative mb-6">
                            <Separator className="bg-border/40" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                                hoặc
                            </span>
                        </div>

                        {/* Login Form */}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        {...field}
                                                        className="pl-10 h-12 rounded-xl bg-background/60 backdrop-blur-md border-border/40 focus:border-primary/50"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="text-foreground">Mật khẩu</FormLabel>
                                                <a
                                                    href="/forgot-password"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Quên mật khẩu?
                                                </a>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className="pl-10 pr-10 h-12 rounded-xl bg-background/60 backdrop-blur-md border-border/40 focus:border-primary/50"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                                Ghi nhớ đăng nhập
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-base font-semibold"
                                    disabled={form.formState.isSubmitting}
                                >
                                    Đăng nhập
                                </Button>
                            </form>
                        </Form>

                        <p className="text-center text-muted-foreground mt-6">
                            Chưa có tài khoản?{" "}
                            <a href="/register" className="text-primary font-medium hover:underline">
                                Đăng ký ngay
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;