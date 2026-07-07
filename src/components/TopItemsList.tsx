import { EntryCard, Badge } from "@contentful/f36-components";
import { TopItem } from "../types/spotify";

interface TopItemsListProps {
  items: TopItem[];
  itemType: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const selectedStyle = { borderLeft: "5px solid rgb(60, 179, 113)" };

export default function TopItemsList({
  items,
  itemType,
  selectedId,
  onSelect,
}: TopItemsListProps) {
  const isTrackList = itemType === "top-tracks";

  return (
    <div>
      {items.map((item) => {
        const imageUrl = isTrackList
          ? item.album?.images?.[0]?.url
          : item.images?.[0]?.url;

        return (
          <EntryCard
            key={item.id}
            contentType={isTrackList ? "Track" : "Artist"}
            title={
              item.name || (isTrackList ? "Unknown Track" : "Unknown Artist")
            }
            description={isTrackList ? item.artists?.[0]?.name ?? "" : undefined}
            badge={<Badge variant="positive">{itemType}</Badge>}
            style={selectedId === item.id ? selectedStyle : undefined}
            thumbnailElement={
              imageUrl ? (
                <img
                  alt={isTrackList ? "track cover" : "artist image"}
                  src={imageUrl}
                />
              ) : (
                <div>No Image</div>
              )
            }
            onClick={() => onSelect(item.id)}
          />
        );
      })}
    </div>
  );
}
