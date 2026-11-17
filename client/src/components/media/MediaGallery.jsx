import { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import MediaThumbnail from './MediaThumbnail'
import MediaLightbox from './MediaLightbox'

const MediaGallery = ({ items, hasMore, isLoading, onLoadMore, emptyText = 'Nothing shared yet.' }) => {
  const [openedItem, setOpenedItem] = useState(null)

  return (
    <>
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {items.map((item) => (
            <button type="button" key={item._id} onClick={() => setOpenedItem(item)} className="block rounded-xl overflow-hidden cursor-pointer">
              <MediaThumbnail url={item.url} type={item.messageType} mediaClassName="w-full aspect-square" playIconSize={24} />
            </button>
          ))}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-5"><CircularProgress size={24} /></div>}
      {!isLoading && items.length === 0 && <p className="text-sm text-slate-500 text-center py-8">{emptyText}</p>}

      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button onClick={onLoadMore} sx={{ textTransform: 'none' }}>Load more</Button>
        </div>
      )}

      {openedItem && <MediaLightbox open onClose={() => setOpenedItem(null)} url={openedItem.url} type={openedItem.messageType} />}
    </>
  )
}

export default MediaGallery
