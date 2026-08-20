"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, User, Copy, X } from "lucide-react";
import { isAddress } from "ethers";

interface Contact {
  id: string;
  name: string;
  address: string;
}

interface ContactsPageProps {
  onBack: () => void;
  onSelect?: (address: string, name: string) => void;
  selectMode?: boolean;
}

export default function ContactsPage({ onBack, onSelect, selectMode }: ContactsPageProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gattipay_contacts");
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem("gattipay_contacts", JSON.stringify(updated));
  };

  const addContact = () => {
    if (!newName.trim()) { setError("Enter a name"); return; }
    if (!isAddress(newAddress)) { setError("Invalid wallet address"); return; }
    const newContact: Contact = { id: Date.now().toString(), name: newName.trim(), address: newAddress };
    saveContacts([...contacts, newContact]);
    setNewName(""); setNewAddress(""); setError(""); setShowAdd(false);
  };

  const deleteContact = (id: string) => {
    if (confirm("Remove this contact?")) {
      saveContacts(contacts.filter(c => c.id !== id));
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={18} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{selectMode ? "Select Contact" : "Contacts"}</span>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "var(--accent)", border: "none", borderRadius: 12, padding: "8px", cursor: "pointer", display: "flex" }}>
          <Plus size={18} color="#0a0e14" />
        </button>
      </div>

      <div style={{ flex: 1, padding: "0 16px", overflow: "auto" }}>
        {contacts.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={28} color="var(--text-muted)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>No contacts yet</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 240 }}>Save frequently used addresses for quick access.</div>
            <button onClick={() => setShowAdd(true)} style={{ background: "var(--accent)", border: "none", borderRadius: 14, padding: "12px 24px", fontSize: 13, fontWeight: 800, color: "#0a0e14", cursor: "pointer", marginTop: 8 }}>+ Add Contact</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
            {contacts.map((c) => (
              <div key={c.id} onClick={() => selectMode && onSelect?.(c.address, c.name)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: selectMode ? "pointer" : "default" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "var(--accent)" }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{c.address.slice(0, 8)}...{c.address.slice(-6)}</div>
                  </div>
                </div>
                {!selectMode && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); copyAddress(c.address); }} style={{ background: "var(--surface3)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
                      <Copy size={14} color="var(--text-muted)" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteContact(c.id); }} style={{ background: "rgba(244,63,94,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}>
                      <Trash2 size={14} color="var(--red)" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border-light)", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Add Contact</span>
              <button onClick={() => { setShowAdd(false); setError(""); }} style={{ background: "var(--surface3)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                <X size={16} color="var(--text-muted)" />
              </button>
            </div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. Rahul)" style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: "var(--text)", outline: "none", marginBottom: 10 }} />
            <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="0x wallet address" style={{ width: "100%", background: "var(--surface3)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "monospace", marginBottom: error ? 6 : 16 }} />
            {error && <div style={{ fontSize: 11, color: "var(--red)", marginBottom: 16, fontWeight: 600 }}>{error}</div>}
            <button onClick={addContact} style={{ width: "100%", background: "var(--accent)", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, color: "#0a0e14", cursor: "pointer" }}>Save Contact</button>
          </div>
        </div>
      )}
    </div>
  );
}