import { useDispatch, useSelector } from 'react-redux'
import BackHeader from '../common/BackHeader'
import MediaGallery from '../media/MediaGallery'
import { fetchSharedMedia } from '../../redux/slices/contactSlice'
import { getSharedMedia, getSharedMediaCursor, getSharedMediaHasMore, getSharedMediaLoading } from '../../redux/selectors/contact.selector'

const SharedMediaScreen = ({ userId, onBack, className = '' }) => {
  const dispatch = useDispatch()
  const media = useSelector(getSharedMedia)
  const cursor = useSelector(getSharedMediaCursor)
  const hasMore = useSelector(getSharedMediaHasMore)
  const isLoading = useSelector(getSharedMediaLoading)

  return (
    <section className={`flex-1 min-w-0 min-h-0 flex flex-col bg-white ${className}`}>
      <BackHeader title="Shared Media" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-[#fafaff]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <MediaGallery
            items={media}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={() => dispatch(fetchSharedMedia({ userId, before: cursor }))}
            emptyText="No photos or videos shared yet."
          />
        </div>
      </div>
    </section>
  )
}

export default SharedMediaScreen
