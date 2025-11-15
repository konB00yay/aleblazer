"use server"

export async function getBreweryCrawl(city, state, maxDistance, numBreweries) {
  try {
    const response = await fetch(
      `https://api.openbrewerydb.org/v1/breweries?by_city=${encodeURIComponent(city)}&per_page=50`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch breweries')
    }
    
    const breweries = await response.json()
    
    // Filter out breweries without coordinates and closed ones
    const validBreweries = breweries.filter(
      b => b.latitude && b.longitude && b.brewery_type !== 'closed'
    )
    
    if (validBreweries.length === 0) {
      return { error: 'No breweries found with valid coordinates' }
    }
    
    // Try every brewery as a starting point and pick the best crawl
    const crawl = findBestBreweryCrawl(validBreweries, maxDistance, numBreweries)
    
    if (crawl.length === 0) {
      return { error: 'Could not find any breweries to start the crawl' }
    }
    
    if (crawl.length < numBreweries) {
      return { 
        breweries: crawl, 
        warning: `Only found ${crawl.length} breweries within ${maxDistance} miles of each other` 
      }
    }
    
    return { breweries: crawl }
    
  } catch (error) {
    console.error('Error fetching breweries:', error)
    return { error: 'Failed to fetch breweries' }
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

// Try every brewery as a starting point and return the longest crawl found
function findBestBreweryCrawl(breweries, maxDistance, numBreweries) {
  let bestCrawl = []
  
  // Try each brewery as a starting point
  for (let i = 0; i < breweries.length; i++) {
    const crawl = createBreweryCrawl(breweries, maxDistance, numBreweries, i)
    
    // Keep the longest crawl we find
    if (crawl.length > bestCrawl.length) {
      bestCrawl = crawl
    }
    
    // If we found enough breweries, we can stop early
    if (bestCrawl.length >= numBreweries) {
      break
    }
  }
  
  return bestCrawl
}

// Create a brewery crawl starting from a specific index
function createBreweryCrawl(breweries, maxDistance, numBreweries, startIndex = 0) {
  if (breweries.length === 0) return []
  
  const crawl = []
  const remaining = [...breweries]
  
  // Start with the brewery at startIndex
  let current = remaining.splice(startIndex, 1)[0]
  crawl.push(current)
  
  // Keep adding nearest breweries within max distance
  while (crawl.length < numBreweries && remaining.length > 0) {
    let nearestIndex = -1
    let nearestDistance = Infinity
    
    // Find nearest brewery within max distance FROM CURRENT LOCATION
    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(
        parseFloat(current.latitude),
        parseFloat(current.longitude),
        parseFloat(remaining[i].latitude),
        parseFloat(remaining[i].longitude)
      )
      
      // Must be within maxDistance AND closer than previous candidates
      if (distance <= maxDistance && distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }
    
    // If we found a nearby brewery, add it to crawl
    if (nearestIndex !== -1) {
      current = remaining[nearestIndex] // UPDATE: current is now the new brewery
      crawl.push({
        ...current,
        distanceFromPrevious: nearestDistance.toFixed(2)
      })
      remaining.splice(nearestIndex, 1)
    } else {
      // No more breweries within range from current location
      break
    }
  }
  
  return crawl
}