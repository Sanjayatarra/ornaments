import { useState, useEffect } from 'react'
import { PlusCircle, Loader2, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import './App.css'

const CATEGORIES = ["Rings", "Necklaces", "Chains", "Earrings", "Bangles"]
const METALS = ["Gold", "Silver"]
const PURITIES = {
  Gold: ["24K", "22K", "18K", "14K"],
  Silver: ["925", "999"]
}
const OCCASIONS = [
  "Wedding", "Daily Wear", "Office Wear", "Temple Jewellery",
  "Antique", "Luxury", "Kids", "Festive"
]
const GENDERS = ["Men", "Women", "Unisex", "Kids"]
const CERTIFICATIONS = ["BIS Hallmark", "IGI", "GIA", "SGL", "None"]
const TAGS = ["Best Seller", "New Arrival", "Trending", "Premium", "Lightweight", "Handmade", "Exclusive"]

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

async function getOrCreateMaster(endpoint, payload, matchKey, matchVal) {
  const res = await fetch(`http://localhost:8000/api/${endpoint}/`)
  const data = await res.json()
  const items = data.results || data

  const match = items.find(item => String(item[matchKey]).toLowerCase() === String(matchVal).toLowerCase())
  if (match) {
    return match.id
  }

  const createRes = await fetch(`http://localhost:8000/api/${endpoint}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const createdItem = await createRes.json()
  return createdItem.id
}

function App() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    category: '', // initialized dynamically
    metal: METALS[0],
    purity: PURITIES[METALS[0]][0],
    occasions: [],
    gender: GENDERS[1], // default Women
    certification: CERTIFICATIONS[0], // default BIS Hallmark
    tags: [],
    sku: '',
    barcode: '',
    weight: 0,
    stock: 10,
    metal_value: 0,
    stone_value: 0,
    making_charge: 0,
    gst: 0,
    discount: 0,
    image_url: '',
    featured: false // default false
  })

  const [categoriesList, setCategoriesList] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryImgType, setNewCategoryImgType] = useState('file') // 'file' or 'url'
  const [newCategoryImgUrl, setNewCategoryImgUrl] = useState('')
  const [newCategoryUploading, setNewCategoryUploading] = useState(false)

  const [metalsList, setMetalsList] = useState([])
  const [goldPrice, setGoldPrice] = useState('')
  const [silverPrice, setSilverPrice] = useState('')

  const [bannersList, setBannersList] = useState([])
  const [selectedBannerName, setSelectedBannerName] = useState('Spotlight Main')
  const [bannerImgUrl, setBannerImgUrl] = useState('')
  const [bannerTargetUrl, setBannerTargetUrl] = useState('products.html')
  const [bannerImgType, setBannerImgType] = useState('file') // 'file' or 'url'
  const [bannerUploading, setBannerUploading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [imageSourceType, setImageSourceType] = useState('file') // 'file' or 'url'
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch categories, metals, and storefront banners from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories/')
        const data = await res.json()
        const items = data.results || data
        setCategoriesList(items)
        if (items.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: items[0].name
          }))
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        // fallback static list
        const staticList = CATEGORIES.map(c => ({ id: c, name: c }))
        setCategoriesList(staticList)
        setFormData(prev => ({
          ...prev,
          category: CATEGORIES[0]
        }))
      }
    }

    const fetchMetals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/metals/')
        const data = await res.json()
        const items = data.results || data
        setMetalsList(items)

        const goldItem = items.find(m => m.name.toLowerCase() === 'gold')
        const silverItem = items.find(m => m.name.toLowerCase() === 'silver')
        if (goldItem) setGoldPrice(goldItem.price_per_gram)
        if (silverItem) setSilverPrice(silverItem.price_per_gram)
      } catch (err) {
        console.error("Error fetching metals:", err)
      }
    }

    const fetchBanners = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/storefront_banners/')
        const data = await res.json()
        const items = data.results || data || []
        setBannersList(items)

        const active = items.find(b => b.name === 'Spotlight Main')
        if (active) {
          setBannerImgUrl(active.image || '')
          setBannerTargetUrl(active.target_url || 'products.html')
        }
      } catch (err) {
        console.error("Error fetching banners:", err)
      }
    }

    fetchCategories()
    fetchMetals()
    fetchBanners()
  }, [])

  // Real-time calculated pricing previews
  const currentMetalPrice = formData.metal.toLowerCase() === 'gold' ? parseFloat(goldPrice || 0) : parseFloat(silverPrice || 0)
  const purityPct = formData.purity === '24K' || formData.purity === '999' ? 99.9
    : (formData.purity === '22K' ? 91.6
      : (formData.purity === '18K' ? 75.0
        : (formData.purity === '14K' ? 58.3
          : (formData.purity === '925' ? 92.5 : 100.0))))

  const estimatedMetalValue = (parseFloat(formData.weight || 0) * currentMetalPrice * (purityPct / 100)).toFixed(2)
  const estimatedSubtotal = parseFloat(estimatedMetalValue) + parseFloat(formData.stone_value || 0) + parseFloat(formData.making_charge || 0)
  const gstRate = parseFloat(formData.gst || 0)
  const estimatedGstAmount = (estimatedSubtotal * gstRate / 100).toFixed(2)

  const sellingPrice = (
    estimatedSubtotal +
    parseFloat(estimatedGstAmount) -
    parseFloat(formData.discount || 0)
  ).toFixed(2)


  // Auto SKU and Barcode generator
  const handleAutoGenerate = () => {
    if (!formData.name) {
      setStatus({ type: 'error', message: 'Please enter a product name first.' })
      return
    }
    const cleanName = formData.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '')
    const metalCode = formData.metal.substring(0, 2).toUpperCase()
    const purityCode = formData.purity.toUpperCase()
    const randSKU = Math.floor(100 + Math.random() * 900)
    const randBarcode = Math.floor(10000000 + Math.random() * 90000000)

    setFormData(prev => ({
      ...prev,
      sku: `${cleanName}-${metalCode}-${purityCode}-${randSKU}`,
      barcode: `BAR-${randBarcode}`
    }))
    setStatus({ type: 'info', message: 'SKU and Barcode generated successfully!' })
  }

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    setStatus({ type: 'info', message: 'Uploading image to server...' })

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: uploadData
      })
      if (!res.ok) {
        throw new Error('Failed to upload image')
      }
      const data = await res.json()
      setFormData(prev => ({
        ...prev,
        image_url: data.image_url
      }))
      setStatus({ type: 'success', message: 'Image uploaded successfully!' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Image upload failed. Please try again.' })
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle metal price updates
  const handleUpdateMetalPrices = async (e) => {
    e.preventDefault()
    setStatus({ type: 'info', message: 'Updating metal prices...' })
    try {
      const goldItem = metalsList.find(m => m.name.toLowerCase() === 'gold')
      const silverItem = metalsList.find(m => m.name.toLowerCase() === 'silver')

      if (goldItem) {
        await fetch(`http://localhost:8000/api/metals/${goldItem.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price_per_gram: parseFloat(goldPrice || 0) })
        })
      }
      if (silverItem) {
        await fetch(`http://localhost:8000/api/metals/${silverItem.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price_per_gram: parseFloat(silverPrice || 0) })
        })
      }
      setStatus({ type: 'success', message: 'Metal prices updated successfully! All product prices recalculated.' })

      // Refresh metals from backend
      const res = await fetch('http://localhost:8000/api/metals/')
      const data = await res.json()
      const items = data.results || data
      setMetalsList(items)
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Failed to update metal prices.' })
    }
  }

  // Handle category creation
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const nameClean = newCategoryName.trim()
    const nameLower = nameClean.toLowerCase()
    const duplicate = categoriesList.find(c => String(c.name || '').toLowerCase() === nameLower)
    if (duplicate) {
      setStatus({ type: 'error', message: `Category "${nameClean}" already exists!` })
      return
    }

    try {
      const slug = slugify(nameClean)
      const res = await fetch('http://localhost:8000/api/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameClean,
          slug: slug,
          image: newCategoryImgUrl,
          active: true
        })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        let errMsg = 'Failed to create category.'
        if (errData && typeof errData === 'object') {
          errMsg = Object.entries(errData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ') || errMsg
        }
        throw new Error(errMsg)
      }
      const newCat = await res.json()
      setCategoriesList(prev => [...prev, newCat])
      setFormData(prev => ({
        ...prev,
        category: newCat.name
      }))
      setNewCategoryName('')
      setNewCategoryImgUrl('')
      setStatus({ type: 'success', message: `Category "${newCat.name}" created successfully!` })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to create category.' })
    }
  }

  const handleCategoryImgUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setNewCategoryUploading(true)
    setStatus({ type: 'info', message: 'Uploading category image...' })

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: uploadData
      })
      if (!res.ok) {
        throw new Error('Failed to upload image')
      }
      const data = await res.json()
      setNewCategoryImgUrl(data.image_url)
      setStatus({ type: 'success', message: 'Category image uploaded successfully!' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Category image upload failed.' })
    } finally {
      setNewCategoryUploading(false)
    }
  }

  // Handle banner select dropdown change
  const handleBannerSelectChange = (name) => {
    setSelectedBannerName(name)
    const banner = bannersList.find(b => b.name === name)
    if (banner) {
      setBannerImgUrl(banner.image || '')
      setBannerTargetUrl(banner.target_url || 'products.html')
    } else {
      setBannerImgUrl('')
      setBannerTargetUrl('products.html')
    }
  }

  // Handle banner updates
  const handleBannerSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'info', message: 'Saving banner settings...' })
    try {
      const banner = bannersList.find(b => b.name === selectedBannerName)
      if (!banner) {
        throw new Error(`Banner "${selectedBannerName}" not found in database. Please run migrations and seed data.`)
      }

      const res = await fetch(`http://localhost:8000/api/storefront_banners/${banner.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: bannerImgUrl,
          target_url: bannerTargetUrl
        })
      })
      if (!res.ok) {
        throw new Error('Failed to update banner')
      }
      setStatus({ type: 'success', message: `Storefront Banner "${selectedBannerName}" updated successfully!` })

      // Refresh banners
      const refreshRes = await fetch('http://localhost:8000/api/storefront_banners/')
      const data = await refreshRes.json()
      setBannersList(data.results || data || [])
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save banner settings.' })
    }
  }

  // Handle banner file upload
  const handleBannerImgUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setBannerUploading(true)
    setStatus({ type: 'info', message: 'Uploading banner image...' })

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: uploadData
      })
      if (!res.ok) {
        throw new Error('Failed to upload image')
      }
      const data = await res.json()
      setBannerImgUrl(data.image_url)
      setStatus({ type: 'success', message: 'Banner image uploaded successfully!' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Banner image upload failed.' })
    } finally {
      setBannerUploading(false)
    }
  }

  // Handle metal dependency change
  const handleMetalChange = (e) => {
    const selectedMetal = e.target.value
    setFormData(prev => ({
      ...prev,
      metal: selectedMetal,
      purity: PURITIES[selectedMetal][0]
    }))
  }

  // Handle standard changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle checkbox arrays
  const handleCheckboxChange = (name, val) => {
    setFormData(prev => {
      const currentList = prev[name]
      const newList = currentList.includes(val)
        ? currentList.filter(item => item !== val)
        : [...currentList, val]
      return {
        ...prev,
        [name]: newList
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: 'info', message: 'Initializing submission... connecting to database.' })

    try {
      // 1. Resolve master tables
      setStatus({ type: 'info', message: 'Resolving metal & purity references...' })
      const metalId = await getOrCreateMaster("metals", { name: formData.metal }, "name", formData.metal)

      const pct = formData.purity === '24K' || formData.purity === '999' ? 99.9
        : (formData.purity === '22K' ? 91.6
          : (formData.purity === '18K' ? 75.0
            : (formData.purity === '14K' ? 58.3
              : (formData.purity === '925' ? 92.5 : 100))))

      const purityId = await getOrCreateMaster("purities", { name: formData.purity, purity_percent: pct }, "name", formData.purity)

      setStatus({ type: 'info', message: 'Resolving category, gender & certification references...' })
      const categoryId = await getOrCreateMaster("categories", { name: formData.category, slug: slugify(formData.category) }, "name", formData.category)
      const genderId = await getOrCreateMaster("genders", { name: formData.gender }, "name", formData.gender)

      let certId = null
      if (formData.certification !== 'None') {
        certId = await getOrCreateMaster("certifications", { name: formData.certification }, "name", formData.certification)
      }

      // 2. Create parent Product
      setStatus({ type: 'info', message: 'Creating parent Product record...' })
      const slug = `${slugify(formData.name)}-${Math.random().toString(36).substring(2, 7)}`
      const prodRes = await fetch('http://localhost:8000/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: slug,
          description: formData.description,
          short_description: formData.short_description,
          category: categoryId,
          gender: genderId,
          brand: null,
          collection: null,
          certification: certId,
          featured: formData.featured,
          active: true
        })
      })

      if (!prodRes.ok) {
        throw new Error(`Product creation failed: ${prodRes.statusText}`)
      }
      const productObj = await prodRes.json()
      const productId = productObj.id

      // 3. Link Occasions
      if (formData.occasions.length > 0) {
        setStatus({ type: 'info', message: 'Linking selected occasions...' })
        for (const occ of formData.occasions) {
          const occId = await getOrCreateMaster("occasions", { name: occ }, "name", occ)
          await fetch('http://localhost:8000/api/product_occasions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product: productId, occasion: occId })
          })
        }
      }

      // 4. Link Tags
      if (formData.tags.length > 0) {
        setStatus({ type: 'info', message: 'Linking tags...' })
        for (const tg of formData.tags) {
          const tagId = await getOrCreateMaster("tags", { name: tg }, "name", tg)
          await fetch('http://localhost:8000/api/product_tags/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product: productId, tag: tagId })
          })
        }
      }

      // 5. Create Image if URL provided
      if (formData.image_url) {
        setStatus({ type: 'info', message: 'Adding product image...' })
        await fetch('http://localhost:8000/api/product_images/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: productId,
            image_url: formData.image_url,
            is_thumbnail: true,
            sort_order: 0,
            alt_text: formData.name
          })
        })
      }

      // 6. Create ProductVariant
      setStatus({ type: 'info', message: 'Creating Product Variant & Pricing...' })
      const skuVal = formData.sku || `${formData.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      const barcodeVal = formData.barcode || `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`

      const varRes = await fetch('http://localhost:8000/api/product_variants/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productId,
          sku: skuVal,
          metal: metalId,
          purity: purityId,
          weight: parseFloat(formData.weight || 0),
          barcode: barcodeVal,
          status: "Active",
          metal_value: parseFloat(estimatedMetalValue || 0).toFixed(2),
          stone_value: parseFloat(formData.stone_value || 0).toFixed(2),
          making_charge: parseFloat(formData.making_charge || 0).toFixed(2),
          gst: parseFloat(formData.gst || 0).toFixed(2),
          discount: parseFloat(formData.discount || 0).toFixed(2),
          selling_price: parseFloat(sellingPrice).toFixed(2)
        })
      })

      if (!varRes.ok) {
        const errDetails = await varRes.json()
        throw new Error(JSON.stringify(errDetails))
      }
      const variantObj = await varRes.json()
      const variantId = variantObj.id

      // 7. Register Inventory
      setStatus({ type: 'info', message: 'Initializing stock quantities...' })
      await fetch('http://localhost:8000/api/inventory/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: variantId,
          quantity: parseInt(formData.stock || 0),
          reserved_quantity: 0,
          available_quantity: parseInt(formData.stock || 0),
          low_stock_threshold: 5
        })
      })

      setStatus({ type: 'success', message: 'Product successfully refactored and populated in database!' })
      // Clear form
      setFormData({
        name: '',
        description: '',
        short_description: '',
        category: CATEGORIES[0],
        metal: METALS[0],
        purity: PURITIES[METALS[0]][0],
        occasions: [],
        gender: GENDERS[1],
        certification: CERTIFICATIONS[0],
        tags: [],
        sku: '',
        barcode: '',
        weight: 0,
        stock: 10,
        metal_value: 0,
        stone_value: 0,
        making_charge: 0,
        gst: 0,
        discount: 0,
        image_url: ''
      })

    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: `Submission failed: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1> ERP</h1>
        <p className="subtitle">Enter new jewelry products, variants, pricing, and stock into the ERP</p>
      </header>

      {/* Settings Grid for Categories and Metal Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Category Upload Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#c7d2fe', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            Add New Category
          </h2>
          <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Rings, Necklaces, Bangles"
                required
              />
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Category Image</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewCategoryImgType('file')}
                    style={{
                      background: newCategoryImgType === 'file' ? '#6366f1' : 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '0.1rem 0.4rem',
                      color: '#fff',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategoryImgType('url')}
                    style={{
                      background: newCategoryImgType === 'url' ? '#6366f1' : 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '0.1rem 0.4rem',
                      color: '#fff',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    URL
                  </button>
                </div>
              </div>

              {newCategoryImgType === 'file' ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImgUpload}
                  disabled={newCategoryUploading}
                  style={{ background: 'rgba(255,255,255,0.01)', padding: '0.4rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                />
              ) : (
                <input
                  type="text"
                  value={newCategoryImgUrl}
                  onChange={(e) => setNewCategoryImgUrl(e.target.value)}
                  placeholder="Image URL"
                />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
              {newCategoryImgUrl ? (
                <img src={newCategoryImgUrl} alt="Category preview" style={{ height: '35px', width: '35px', borderRadius: '4px', objectFit: 'cover' }} />
              ) : <div />}
              <button type="submit" disabled={newCategoryUploading} style={{ background: '#10b981', border: 'none', borderRadius: '6px', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '600' }}>
                Create Category
              </button>
            </div>
          </form>
        </div>

        {/* Metal Prices Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#c7d2fe', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            Update Metal Prices (per gram)
          </h2>
          <form onSubmit={handleUpdateMetalPrices} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Gold Price (24K, INR/g)</label>
              <input
                type="number"
                step="0.01"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                placeholder="e.g. 6100.00"
                required
              />
            </div>

            <div className="input-group">
              <label>Silver Price (INR/g)</label>
              <input
                type="number"
                step="0.01"
                value={silverPrice}
                onChange={(e) => setSilverPrice(e.target.value)}
                placeholder="e.g. 75.00"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
              <button type="submit" style={{ background: '#6366f1', border: 'none', borderRadius: '6px', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '600' }}>
                Update Metal Prices
              </button>
            </div>
          </form>
        </div>

        {/* Storefront Banners Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#c7d2fe', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            Manage Storefront Banners
          </h2>
          <form onSubmit={handleBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Select Banner Slot</label>
              <select
                value={selectedBannerName}
                onChange={(e) => handleBannerSelectChange(e.target.value)}
              >
                <option value="Hero Slide 1">Hero Slide 1 (Main Slider)</option>
                <option value="Hero Slide 2">Hero Slide 2 (Main Slider)</option>
                <option value="Hero Slide 3">Hero Slide 3 (Main Slider)</option>
                <option value="Spotlight Main">Spotlight Main (Large)</option>
                <option value="Spotlight 1">Spotlight 1 (Small Left)</option>
                <option value="Spotlight 2">Spotlight 2 (Small Mid-Left)</option>
                <option value="Spotlight 3">Spotlight 3 (Small Mid-Right)</option>
                <option value="Spotlight 4">Spotlight 4 (Small Right)</option>
              </select>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Banner Image</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setBannerImgType('file')}
                    style={{
                      background: bannerImgType === 'file' ? '#6366f1' : 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '0.1rem 0.4rem',
                      color: '#fff',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerImgType('url')}
                    style={{
                      background: bannerImgType === 'url' ? '#6366f1' : 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      padding: '0.1rem 0.4rem',
                      color: '#fff',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    URL
                  </button>
                </div>
              </div>

              {bannerImgType === 'file' ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImgUpload}
                  disabled={bannerUploading}
                  style={{ background: 'rgba(255,255,255,0.01)', padding: '0.4rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                />
              ) : (
                <input
                  type="text"
                  value={bannerImgUrl}
                  onChange={(e) => setBannerImgUrl(e.target.value)}
                  placeholder="Banner Image URL"
                />
              )}
            </div>

            <div className="input-group">
              <label>Target Page / Link</label>
              <input
                type="text"
                value={bannerTargetUrl}
                onChange={(e) => setBannerTargetUrl(e.target.value)}
                placeholder="e.g. products.html?category=Rings"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
              {bannerImgUrl ? (
                <img src={bannerImgUrl} alt="Banner preview" style={{ height: '35px', width: '70px', borderRadius: '4px', objectFit: 'cover' }} />
              ) : <div />}
              <button type="submit" disabled={bannerUploading} style={{ background: '#6366f1', border: 'none', borderRadius: '6px', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '600' }}>
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          <h2 className="section-title">1. Product Information</h2>

          <div className="input-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Elegant Solitaire Gold Ring"
              required
            />
          </div>

          <div className="input-group">
            <label>Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="e.g. A gorgeous gold engagement ring"
              required
            />
          </div>

          <div className="input-group full-width">
            <label>Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed description here..."
              required
            />
          </div>

          <div className="input-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {categoriesList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Certification</label>
            <select name="certification" value={formData.certification} onChange={handleChange}>
              {CERTIFICATIONS.map(cert => <option key={cert} value={cert}>{cert}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              style={{ width: 'auto', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="featured" style={{ cursor: 'pointer', margin: 0, userSelect: 'none' }}>Featured Product (Top Seller)</label>
          </div>

          <div className="input-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Product Main Image</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setImageSourceType('file')}
                  style={{
                    background: imageSourceType === 'file' ? '#6366f1' : 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceType('url')}
                  style={{
                    background: imageSourceType === 'url' ? '#6366f1' : 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageSourceType === 'file' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.2)',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                {uploadingImage && <p style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Uploading image to server...</p>}
                {formData.image_url && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview:</span>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="e.g. https://domain.com/path-to-image.jpg"
                  style={{ width: '100%' }}
                />
                {formData.image_url && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview:</span>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>


          <h2 className="section-title">2. Material Specs & Variant Attributes</h2>

          <div className="input-group">
            <label>Metal Type</label>
            <select name="metal" value={formData.metal} onChange={handleMetalChange}>
              {METALS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Purity (dependent)</label>
            <select name="purity" value={formData.purity} onChange={handleChange}>
              {PURITIES[formData.metal].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Metal Weight (grams)</label>
            <input
              type="number"
              step="0.001"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Stock Quantity (Inventory)</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>SKU & Barcode</label>
              <button
                type="button"
                onClick={handleAutoGenerate}
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '8px',
                  color: '#c7d2fe',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.4rem 0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Sparkles size={12} /> Auto-Generate
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SKU Code"
                required
              />
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Barcode"
              />
            </div>
          </div>

          <h2 className="section-title">3. Occasions & Marketing Tags</h2>

          <div className="input-group full-width">
            <label>Occasions (Choose multiple)</label>
            <div className="multi-select-grid">
              {OCCASIONS.map(occ => (
                <label key={occ} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.occasions.includes(occ)}
                    onChange={() => handleCheckboxChange("occasions", occ)}
                  />
                  {occ}
                </label>
              ))}
            </div>
          </div>

          <div className="input-group full-width">
            <label>Tags (Choose multiple)</label>
            <div className="multi-select-grid">
              {TAGS.map(tag => (
                <label key={tag} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleCheckboxChange("tags", tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <h2 className="section-title">4. Pricing Structure</h2>

          <div className="input-group">
            <label>Metal Value (Auto Estimated)</label>
            <input
              type="number"
              step="0.01"
              name="metal_value"
              value={estimatedMetalValue}
              readOnly
              style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              weight ({formData.weight}g) * rate (₹{currentMetalPrice}/g) * purity ({purityPct}%)
            </span>
          </div>

          <div className="input-group">
            <label>Stone Value</label>
            <input
              type="number"
              step="0.01"
              name="stone_value"
              value={formData.stone_value}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Making Charges</label>
            <input
              type="number"
              step="0.01"
              name="making_charge"
              value={formData.making_charge}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>GST Rate (%)</label>
            <input
              type="number"
              step="0.01"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              placeholder="e.g. 3.0"
            />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Est. GST Amount: ₹{estimatedGstAmount}
            </span>
          </div>

          <div className="input-group">
            <label>Discount Amount</label>
            <input
              type="number"
              step="0.01"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>

          <div className="pricing-preview">
            <div>
              <h3>Calculated Selling Price</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                (Metal + Stone + Making + GST - Discount)
              </p>
            </div>
            <div className="pricing-value">₹{sellingPrice}</div>
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.type === 'info' && <Loader2 size={16} className="animate-spin" />}
              {status.type === 'success' && <CheckCircle2 size={16} />}
              {status.type === 'error' && <AlertTriangle size={16} />}
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn full-width"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving Jewelry Data...
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Populate Database
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  )
}

export default App
