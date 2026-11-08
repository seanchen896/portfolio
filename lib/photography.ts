/** Shared types and validation; intentionally independent of saved JSON. */
export type Photograph = {
  id: string; src: string; title: string; description: string; category: string;
  date?: string; width?: number; height?: number; collectionIds: string[];
};
export type PhotoCollection = { id: string; title: string; description: string; coverId?: string };
export type PhotographyData = { photos: Photograph[]; collections: PhotoCollection[]; featuredId: string | null };
export const emptyPhotography = (): PhotographyData => ({ photos: [], collections: [], featuredId: null });

export function validatePhotography(value: unknown): asserts value is PhotographyData {
  const data = value as PhotographyData;
  if (!data || !Array.isArray(data.photos) || !Array.isArray(data.collections) || data.photos.length > 2000 || data.collections.length > 200) throw new Error("Invalid photography portfolio.");
  const ids = new Set<string>(); const collections = new Set<string>();
  const text = (value: unknown) => typeof value === "string" && value.length <= 10000;
  const id = (value: unknown) => typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
  for (const collection of data.collections) {
    if (!collection || !id(collection.id) || collections.has(collection.id) || !text(collection.title) || !collection.title.trim() || !text(collection.description)) throw new Error("Every collection needs a unique ID and a title.");
    collections.add(collection.id);
  }
  for (const photo of data.photos) {
    if (!photo || !id(photo.id) || ids.has(photo.id) || typeof photo.src !== "string" || !/^\/(?:photography|projects)\/[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i.test(photo.src) || photo.src.includes("..") || !text(photo.title) || !photo.title.trim() || !text(photo.description) || !text(photo.category)) throw new Error("Each photograph needs a unique ID, a title, and a local image.");
    if (!Array.isArray(photo.collectionIds) || new Set(photo.collectionIds).size !== photo.collectionIds.length || !photo.collectionIds.every(value => collections.has(value))) throw new Error("Choose existing collections for each photograph.");
    if (photo.date !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(photo.date) || !Number.isFinite(Date.parse(photo.date)) || new Date(photo.date).toISOString().slice(0, 10) !== photo.date)) throw new Error("Use a valid photograph date.");
    for (const size of [photo.width, photo.height]) if (size !== undefined && (!Number.isInteger(size) || size <= 0 || size > 100000)) throw new Error("Invalid photo dimensions.");
    ids.add(photo.id);
  }
  if (data.featuredId !== null && !ids.has(data.featuredId)) throw new Error("Choose an existing featured photograph.");
  for (const collection of data.collections) if (collection.coverId !== undefined && !data.photos.some(photo => photo.id === collection.coverId && photo.collectionIds.includes(collection.id))) throw new Error("A collection cover must belong to that collection.");
}
