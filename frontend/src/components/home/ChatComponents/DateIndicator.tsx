import { getRelativeDateTime, isSameDay } from "@/lib/utils";
import { Message } from "@/store/useChatStore";

type DateIndicatorProps = {
	message: Message;
	previousMessage?: Message;
};
const DateIndicator = ({ message, previousMessage }: DateIndicatorProps) => {
	return (
		<>
			{!previousMessage || !isSameDay(Date.parse(previousMessage.createdAt), Date.parse(message.createdAt)) ? (
				<div className='flex justify-center'>	
					<p className='text-sm text-foreground mb-2 p-1 z-30 rounded-md bg-input	'>
						{/* {getRelativeDateTime(message, previousMessage)} */}
						{getRelativeDateTime(
							{ ...message, _creationTime: Date.parse(message.createdAt) },
							previousMessage ? { ...previousMessage, _creationTime: Date.parse(previousMessage.createdAt) } : undefined
						)}
					</p>
				</div>
			) : null}
		</>
	);
};
export default DateIndicator;