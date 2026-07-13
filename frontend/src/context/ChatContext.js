import { createContext, useReducer } from "react";

export const ChatContext = createContext();

const chatReducer = (state, action) => {

    switch (action.type) {

        case "SET_USERS":
            return {
                ...state,
                users: action.payload
            };

        case "SET_SELECTED_USER":
            return {
                ...state,
                selectedUser: action.payload
            };

        case "SET_MESSAGES":
            return {
                ...state,
                messages: action.payload
            };

        case "ADD_MESSAGE":
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };

        case "SET_ONLINE_USERS":
            return {
                ...state,
                onlineUsers: action.payload
            };

        case "SET_TYPING_USER":
            return {
                ...state,
                typingUser: action.payload
            };

        case "SET_UNREAD_COUNT":
            return {
                ...state,
                unreadCount: action.payload
            };

        case "DELETE_MESSAGE":
            return {
                ...state,
                messages: state.messages.filter(
                message => message._id !== action.payload
                )
            };

        case "UPDATE_MESSAGE":
            return {
                ...state,
                messages: state.messages.map(message =>
                    message._id === action.payload._id
                        ? action.payload
                    : message
                )
            };

        case "SET_REPLY_MESSAGE":
            return {
                ...state,
                replyMessage: action.payload
            };

        case "CLEAR_REPLY_MESSAGE":
            return {
                ...state,
                replyMessage: null
            };
        case "TOGGLE_SEARCH":
            return {
                ...state,
                searchOpen: !state.searchOpen
            };

        case "SET_SEARCH_TEXT":
            return {
                ...state,
                searchText: action.payload
            };
        case "SET_SEARCH_INDEX":
            return {
                ...state,
                searchIndex: action.payload
            };
        case "NEXT_SEARCH_RESULT":
            return {
                ...state,
                searchIndex: state.searchIndex + 1
            };
        case "PREVIOUS_SEARCH_RESULT":
            return {
                ...state,
                searchIndex:
                    state.searchIndex > 0
                        ? state.searchIndex - 1
                        : 0
            };
        case "SET_PINNED_MESSAGE":
            return {
                ...state,
                pinnedMessage: action.payload
            };

        case "CLEAR_PINNED_MESSAGE":
            return {
                ...state,
                pinnedMessage: null
            };
        case "SET_JUMP_MESSAGE":
            return {
                ...state,
                jumpMessageId: action.payload
            };

        case "CLEAR_JUMP_MESSAGE":
            return {
                ...state,
                jumpMessageId: null
            };
        default:
            return state;
    }

};

export const ChatContextProvider = ({ children }) => {

    const [state, dispatch] = useReducer(chatReducer, {

        users: [],
        selectedUser: null,
        messages: [],
        onlineUsers: [],
        typingUser: null,
        unreadCount: 0,
        replyMessages : null,
        searchOpen: false,
        searchText : "",
        searchIndex: 0,
        pinnedMessage: null,
        jumpMessageId: null,

    });

    return (
        <ChatContext.Provider
            value={{ ...state, dispatch }}
        >
            {children}
        </ChatContext.Provider>
    );

};