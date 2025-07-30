import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs : ClassValue[]){
	return twMerge(clsx(inputs));
}


// Function to format a timestamp into a human-readable date or time string
// Function to format a timestamp into a human-readable date or time string
export function formatDate(date_ms: number) {
  // Create a Date object directly from the millisecond timestamp (no conversion needed)
  const date_obj = new Date(date_ms);

  // Get the current date and reset its time to midnight for comparison
  const current_date = new Date();
  current_date.setHours(0, 0, 0, 0);
  const current_time = current_date.getTime();

  // Create a copy of the input date and reset its time to midnight for comparison
  const provided_date = new Date(date_obj);
  provided_date.setHours(0, 0, 0, 0);

  // Check if the input date is today
  if (provided_date.getTime() === current_time) {
    // Return the time in 12-hour format (e.g., "02:30 PM")
    return date_obj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Check if the input date is yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  if (provided_date.getTime() === yesterday.getTime()) {
    // Return "Yesterday" if the date matches
    return "Yesterday";
  }

  // Check if the input date is within the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  oneWeekAgo.setHours(0, 0, 0, 0);
  if (provided_date.getTime() > oneWeekAgo.getTime() && provided_date.getTime() < yesterday.getTime()) {
    // Return the day name (e.g., "Monday")
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[provided_date.getDay()];
  }

  // For older dates, return the date in MM/DD/YYYY format (e.g., "03/15/2025")
  return provided_date.getMonth() + 1 + "/" + provided_date.getDate() + "/" + provided_date.getFullYear();
}
// Function to check if two timestamps fall on the same calendar day
export const isSameDay = (timestamp1 : number , timestamp2 : number) : boolean => {
	// Convert the first and second to a Date object
	const date1 = new Date(timestamp1);
	const date2 = new Date(timestamp2);

	// Compare year, month and day to determine if the are the same
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
};

interface Message{ 
	_creationTime : number;
}

export const getRelativeDateTime = (message : Message , previousMessage?: Message) => {
	// Set reference dates for comparison (today , yesterday and one week ago)
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const lastWeek = new Date(today);
	lastWeek.setDate(lastWeek.getDate() - 7);

	// Convert the message timestamp to a Date object
	const messageDate = new Date(message._creationTime);

	if (!previousMessage || !isSameDay(previousMessage._creationTime, messageDate.getTime())){
		// Check if the message from today 
		if (isSameDay(messageDate.getTime(), today.getTime())){
			// Return "Today" if the messae is from today
			return "Today";
		}
		else if (isSameDay(messageDate.getTime(), yesterday.getTime())){
			// Return the "Yesterday " if the message from yesterday
			return "Yesterday";
		}
		else if (messageDate.getTime() > lastWeek.getTime()){
			const options : Intl.DateTimeFormatOptions = { weekday : "long"};
			return messageDate.toLocaleDateString(undefined, options);
		}
		else {
			// Return the date in format 03/12/2025
			const options : Intl.DateTimeFormatOptions = {day : "2-digit", month: "2-digit" , year : "numeric"};
			return messageDate.toLocaleDateString(undefined , options);
		}
	}
}