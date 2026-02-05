"use client";
import { act, useState } from "react";
import {
  AnimatedTabsContentWrapper,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LoginForm, RegisterForm } from "./forms";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  return (
    <main className="flex-center h-svh">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-4 *:text-lg *:p-4 py-6 px-4 ">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <AnimatedTabsContentWrapper value={activeTab}>
          <LoginForm /> <RegisterForm />
        </AnimatedTabsContentWrapper>
      </Tabs>
    </main>
  );
}
