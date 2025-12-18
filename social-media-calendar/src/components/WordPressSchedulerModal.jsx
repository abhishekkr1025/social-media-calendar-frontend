import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function WordPressSchedulerModal({
  isOpen,
  onClose,
  selectedDate,
  clients,
  selectedClient,
  setSelectedClient,
  post,
  setPost,
  onSchedule
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>
            Schedule Blog Post — {selectedDate}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Client */}
          <div>
            <label className="text-sm font-medium">Client</label>
            <div className="flex gap-2 flex-wrap">
              {clients.map(client => (
                <Button
                  key={client.id}
                  size="sm"
                  variant={selectedClient?.id === client.id ? "default" : "outline"}
                  onClick={() => setSelectedClient(client)}
                >
                  {client.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Input
            placeholder="Blog Title"
            value={post.title}
            onChange={(e) =>
              setPost({ ...post, title: e.target.value })
            }
          />

          {/* Content */}
          <Textarea
            placeholder="Blog Content (HTML supported)"
            rows={6}
            value={post.content}
            onChange={(e) =>
              setPost({ ...post, content: e.target.value })
            }
          />

          {/* Excerpt */}
          <Textarea
            placeholder="Excerpt (optional)"
            rows={2}
            value={post.excerpt}
            onChange={(e) =>
              setPost({ ...post, excerpt: e.target.value })
            }
          />

          {/* Featured Image */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPost({ ...post, file: e.target.files?.[0] || null })
            }
          />

          {/* Time */}
          <Input
            type="time"
            value={post.time}
            onChange={(e) =>
              setPost({ ...post, time: e.target.value })
            }
          />

          {/* Publish Status */}
          <select
            className="w-full border rounded p-2"
            value={post.wpStatus}
            onChange={(e) =>
              setPost({ ...post, wpStatus: e.target.value })
            }
          >
            <option value="publish">Publish immediately</option>
            <option value="draft">Save as Draft</option>
            <option value="future">Schedule</option>
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onSchedule} className="flex-1">
              Schedule Blog
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
