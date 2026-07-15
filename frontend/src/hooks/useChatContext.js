import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const useChatContext = () => {

    const context = useContext(ChatContext);
    if (!context) {
        throw Error(
            "useChatContext must be used inside ChatContextProvider"
        );
    }
    return context;

};

export default useChatContext;