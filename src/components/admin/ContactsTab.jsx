import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, Mail, Phone, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ContactsTab() {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => base44.entities.ContactRequest.list("-created_date")
  });

  const updateStatus = async (contactId, status) => {
    await base44.entities.ContactRequest.update(contactId, { status });
    queryClient.invalidateQueries(["admin-contacts"]);
  };

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    read: "bg-yellow-100 text-yellow-800",
    responded: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800"
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#414A37]">
          Contact Requests ({contacts.length})
        </h2>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <MessageSquare className="w-12 h-12 text-[#DBC2A6] mx-auto mb-4" />
          <p className="text-[#414A37]/60">No contact requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#DBC2A6]/30">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#414A37]">
                      {contact.subject || "No Subject"}
                    </h3>
                    <Badge className={statusColors[contact.status || "new"]}>
                      {contact.status || "new"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#414A37]/60">
                    {contact.created_date && format(new Date(contact.created_date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Select
                  value={contact.status || "new"}
                  onValueChange={(v) => updateStatus(contact.id, v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#414A37]/70">
                  <User className="w-4 h-4" />
                  {contact.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#414A37]/70">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${contact.email}`} className="hover:text-[#B9744A]">
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#414A37]/70">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#F9F7F4] rounded-lg">
                <p className="text-[#414A37] whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}