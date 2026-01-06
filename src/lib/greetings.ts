export const returningClientGreetings = [
  "Welcome back, {name}!",
  "Let's pick up where you left off, {name}!",
  "Ready to plan, {name}?",
  "Let's get into it, {name}!",
  "Alright, let's do this, {name}!",
  "Hey there, {name}!",
  "Ready when you are, {name}!",
];

export function getGreeting(firstName: string, isFirstLogin: boolean): string {
  if (isFirstLogin) {
    return `Welcome, ${firstName}!`;
  }

  // Get a random greeting for returning clients
  const randomIndex = Math.floor(Math.random() * returningClientGreetings.length);
  const greeting = returningClientGreetings[randomIndex];
  return greeting.replace("{name}", firstName);
}
