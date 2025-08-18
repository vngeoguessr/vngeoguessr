// Mapillary API utilities

// Fetch images using city bbox
export async function fetchMapillaryImages(bbox) {
  const accessToken = process.env.MAPILLARY_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MAPILLARY_ACCESS_TOKEN environment variable is not set');
  }

  const bboxString = bbox.join(',');

  const apiUrl = `https://graph.mapillary.com/images?access_token=${accessToken}&fields=id,thumb_original_url,geometry,is_pano&limit=20&bbox=${bboxString}&is_pano=true`;

  // Log API request details in development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== MAPILLARY API REQUEST ===');
    console.log('Request URL:', apiUrl.replace(accessToken, '[HIDDEN]'));
    console.log('Bbox:', bboxString);
    console.log('=== END REQUEST ===');
  }

  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Mapillary authentication failed');
      }
      throw new Error(`Mapillary API error: ${response.status}`);
    }

    const data = await response.json();

    // Log full Mapillary response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== MAPILLARY API RESPONSE ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('=== END MAPILLARY RESPONSE ===');
    }

    if (data.data && data.data.length > 0) {
      console.log(`Found ${data.data.length} images within city bbox`);
      return {
        success: true,
        data: data.data
      };
    }

    return {
      success: false,
      error: 'No street view images found in city bbox'
    };

  } catch (error) {
    console.error('Error fetching Mapillary images:', error);
    throw error;
  }
}
