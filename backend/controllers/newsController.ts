export const viewNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Görüntülenme sayısını artır
    const viewsUpdate = await News.findByIdAndUpdate(
      id,
      {
        $inc: { 'views.total': 1 },
        ...(userId && { 
          $addToSet: { 'views.uniqueUsers': userId } 
        })
      },
      { new: true }
    );

    // Benzersiz kullanıcı sayısını hesapla
    const uniqueViews = viewsUpdate.views.uniqueUsers?.length || 0;

    return res.json({
      newsId: id,
      views: {
        total: viewsUpdate.views.total,
        unique: uniqueViews
      }
    });
  } catch (error) {
    console.error('View news error:', error);
    return res.status(500).json({ message: 'Failed to update views' });
  }
}; 