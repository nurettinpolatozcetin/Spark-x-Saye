import { useEffect, useRef, useState } from "react";
import { supabase } from "../../Database/Supabase";
import "./Chat.css";

function ChatWidget({ selectedProfile, setSelectedProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myProfileId, setMyProfileId] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (selectedProfile) {
      setIsOpen(true);
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedProfile) {
      getMessages();
    }
  }, [selectedProfile]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const getMyProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      setMyProfileId(data.id);
    };

    getMyProfile();
  }, []); 
  const getMessages = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (!selectedProfile) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_profile_id.eq.${myProfile.id},receiver_profile_id.eq.${selectedProfile.id}),and(sender_profile_id.eq.${selectedProfile.id},receiver_profile_id.eq.${myProfile.id})`,
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.log("DM fetch error:", error);
      return;
    }

    setMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    const newMessage = {
      content,
      user_id: userData.user.id,
      email: userData.user.email,

      sender_profile_id: myProfile.id,
      receiver_profile_id: selectedProfile.id,
      receiver_name: selectedProfile.name,
    };
    const { data, error } = await supabase
      .from("messages")
      .insert([newMessage])
      .select();

    if (error) {
      console.log("Message insert error:", error);
      alert(error.message);
      return;
    }

    setMessages((prev) => [...prev, data[0]]);
    setContent("");
    await getMessages();
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <h3>
              {selectedProfile
                ? `Messaging ${selectedProfile.name}`
                : "Messages"}
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedProfile(null);
              }}
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.sender_profile_id === myProfileId
                      ? "my-message"
                      : "other-message"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <input
              placeholder="Write a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          Messages
        </button>
      )}
    </div>
  );
}

export default ChatWidget;
