import { resolveStaticAsset } from './staticAssets'

const categoryLabels: Record<string, string> = {
  Smartphones: '手机',
  Audio: '耳机',
  Computing: '笔记本',
  Wearables: '穿戴',
  'Home Studio': '家居音响',
  手机: '手机',
  耳机: '耳机',
  笔记本: '笔记本',
  穿戴: '穿戴',
  家居音响: '家居音响',
}

const productImageMap: Record<string, string[]> = {
  'iphone-16-black': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuADvbgkXqi6gJ-FZtE1mCWy4suU5ThSa6yA7ihgfHdmLF-3dpuZHS1YApzQXJC9GprSIFEYAMD_GFk1K5VBp3La6GG4YAOMYTflxAddhRV3SLFTFIzJeKAsCdxV6e_IYYUacsHVRDM-um1o_SiFGbUIGPB07laF0g4mcCSKZ0a9JmpG5jmWVIWVfmUds3jTL20jH4HpFNJtEQBzbzy8-FUD1UNJGTaES5bgGZMplCr8dmBU-EfYOH2G7JSLmh8T-0ARyf6mJXWGDFo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhz4bYPA9AS1yUfUFW50Px4lR8__UFYex1L3FwKkDWrYivVJp4vlJKR3pE0fV6L8GFZAtWbbnut9db9EEtvMftfiH8wIzKhl8Y8l0mLH_XBBvBbmrhYwekzSVX1zg5DTf9GercyPkuJHs0FmFTtyYglAIx0QGk_nnSpQLPB2BtlfyAB4pC1EySQbkUc430_n6rPesGbDRDjw8iol3SMsVVn6SllQsdGDoJBI0rKadjVCadXeRBwAR6ywA45r703EDfflF5w1p7B-I',
  ],
  'iphone-16-white': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDtDfYfjmVrI-Nty3B77DvhzvnE9NUZBqC08xNavzgMD78adXv4uAyT2wO_Fi2SVfEgBC9PyUKdP03cUJ-0iNJhG-CUnQzD1V5ePiBSsriNpLqMr-whXLc-Tz8rXrifGJyutZFOrDuJJPAebVC69XVZRrIBbpYE-uA_r2YTNz67mFcUNy10Yxahn7WoWhwBtW_SpEM5r8Pw4AGwL_Wbmv354H1GegJprAiXP-8Vguw2S1uMaqaIMwP_y-SToUp5zpCLmv1dveg80m4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAjNdPSLpga2Nil27boDRQ269mGVZ6z0oawt6mt6KVPRrewUMWJYDNPwau0wFcT67fFnmxCTegXZ4f65KCPPADcSSREEosRpno0tQG0vu26iIt_r5hkQKOLWMrsRwaOQ0VC-IKwDU9x9xjbwA7b6mpImjwfq5LNcWnXuTjOEz3ifGWjG8IsGhOCXXSv0qX6uzfuMiQfygGy7OHC0wr6qFHGWXwuR0HKSOzU_r8kJHpASAJzs5YRCqEptFdXXaYfW3KOOLhVv3H8H_0',
  ],
  'iphone-16-blue': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlWmeMYOToXy2fY9j4Ma7uNW7yAePuzsR9mMP_T-CPVWzp4Ra152DpVpniW6qmt8g-lhmT76JSr6BrfHivNsoN6B2D1a2_ZCxyJliaDkECnT_eb0v_skAQ4E2cik8xbJte-XVgAsGOQCE_88utSQq1HfIvfMz7O8HzDdXfpiQ2dJMDo6YNQO8MMaeNsEIpVRLcHIMzEKyR6u0Z7MH9vwtKBBlZcyU75xO_wmtM-qG09UViNhxXbO3_yzBa2_ksLDqIw-tAT6NbOLs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_dTyjtX7L82ytQpEYPu3aqKaTWE96-Kesbraq7O3ioD_OaXy6UOQvTHFtCEtzzO_BLvtnXkBqhu2GOUNE8mrzgiOFq7ihKaBB-h1yoQba8u-oqsyX9CA43WMmaZ1BiNtrNcg0TkProeIcOP_hK4up15O8O4bf0Vi_k21tBn7du_wSzxGKdVuMMnheu2Z1PruY6-lCkIa1u7_15Cbltdk8OUV95YjeljXTmObrBkaUj1XL0ZQA2uwRS9CO4xMQNx7eoPlkNIM0V1o',
  ],
  'airpods-pro-2': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqjJPPH-umXdy1P87ESFAr0yMknK3JNGdqExGxjNivfeiu0Vx_YJK8yy3t5B6yxfdzW7_U-ZhRKUUBFsIrMUwWE8lErqL68pdGjsR1LjEOKZzQWSHn3t7ckdvjQD6Iv0y6P6nYlU35x103DJFFsXEMNc0rpST9l0GAWzWPGOcuPzXMa_ApE2uBzftCqVw8c0fR2TF97KqIq1mcXbxLTB0SWKtGg940IBJX1Av7qOLtJ-bN3iCrevel0SX63ngnYzHvTZ8xaiylVUw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCkdOA1iozvBjI9LsG8H9kY6ZYTJe9tw6zp-2htLEzgGUOfyle0dL-ApfvMHx2QG8jXORMKQusPTuJcIUtxV5to3mVPBl77uAJZlBIuAPwlhNBty0z7U8ljUzl-5QOJ1x4ie9xposIZh08lc7JRZ3v49U80BPUnYC80RJDoohClkphfQSHji1YggBvN2yahgRksvOjJDBqI_3ur5kFcVjCl3_oGeVVWMlvvXLGN5bRjgXlF3Jaa2GdlRiyhFndVcN-kklRz_fR22dM',
  ],
  'airpods-pro-2-midnight': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAO_sLFdnN1GYrRy1IMuscnvzOqg1B5tHS1K0gGHIR95ZnL_qhey_It_XZnW5JTUBmdRr6bxZS1Ds2_LAq-l1bTSw74cd-_A80HLpaQc9utyl5YD8x09rj8vkxZEQgqsr74ZZZJ7HUkMaSGX-AUFxSIJwZJAtAviQl18O2Chbgcb-beYAAwCDfTi3iWnWektaGZ3FaOr1nfBt_IUByn5h_QGq_AwqwApstbzYXmdPFjgv-fpnPtCRhe-FS5T0Vy1LY63iWe4sa7EQ',
  ],
  'macbook-air-silver': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuClx-oiFh-jZArVFCIfbEprCNryWsMF4IJQgzkZ0I8YoVXfVfXa3EYZI0omBjX5RkVXHmqrOvqlue1l5FO3hFKDDzu5lg46Wj4FwFpHv0U9yhnZmjPHVah4MPKq0frV8zXwVoHLNFZNjBtzz9hOcru_OSwh-9p0O5iFo8M2OW3M9UZC6XjvVQPxMBjgDy9ROMxZbUMVbXQ2poCzg1dxdYIIbrFSa9AWnOFmkR2wUtx09ltqpzA1wOoqYAmkOgy7Qn86Pn3SmtwYgio',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUP0b7EVnc5jKXIGdUo264j7eUIRVLO3dVXZyogtdEE-fZsekoGqIBgyKcsBfpaWSvpSVnq2v1uXXS0cV4U_vMgm2T5bIpJ-s7f53GYjZzOoyg2HaYIexvwnv3w4YPKtlwZOJegF9f202dDcgrmkKfAPkYvYt-3d5fMNC2AB6ev-mBO1bJGO5pFcqI0kkCHcTw6v-JvEE_RQ3kRJcGiKsmDVIDi_NST5ZXxWCYGzNKq78eJGvkUFWuxLOW8eL7lamYwvpBOpLZaIo',
  ],
  'macbook-air-midnight': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA32eTjfD6rXRc1Qqw8r3h6eKnxJjwF60VxQmknzHqi_Dnp-MgF4raQPjFzgPUjkmwUm140iaR5RmPpMlutJoxzDp8547fBwazr1ZHxcO0gBYgQRpvteZ6Ljyl-NgGzRZOwV86UUnOJXbbWxRdiKgPytpalJwjss-c6Y7-iluLUDNsm2SoybhlfQHOnTgGoFVEn5i8MJfirHjK0z_cpp-9EbS3ok0zb38vfKyutIpI6tHa_yTBGRdMpWBo8H6l5ySdXiUJNrsvgSok',
  ],
  'watch-series-10-midnight': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA32eTjfD6rXRc1Qqw8r3h6eKnxJjwF60VxQmknzHqi_Dnp-MgF4raQPjFzgPUjkmwUm140iaR5RmPpMlutJoxzDp8547fBwazr1ZHxcO0gBYgQRpvteZ6Ljyl-NgGzRZOwV86UUnOJXbbWxRdiKgPytpalJwjss-c6Y7-iluLUDNsm2SoybhlfQHOnTgGoFVEn5i8MJfirHjK0z_cpp-9EbS3ok0zb38vfKyutIpI6tHa_yTBGRdMpWBo8H6l5ySdXiUJNrsvgSok',
  ],
  'watch-series-10-silver': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA32eTjfD6rXRc1Qqw8r3h6eKnxJjwF60VxQmknzHqi_Dnp-MgF4raQPjFzgPUjkmwUm140iaR5RmPpMlutJoxzDp8547fBwazr1ZHxcO0gBYgQRpvteZ6Ljyl-NgGzRZOwV86UUnOJXbbWxRdiKgPytpalJwjss-c6Y7-iluLUDNsm2SoybhlfQHOnTgGoFVEn5i8MJfirHjK0z_cpp-9EbS3ok0zb38vfKyutIpI6tHa_yTBGRdMpWBo8H6l5ySdXiUJNrsvgSok',
  ],
  'homepod-mini-duo': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUNy2e5tuoGeAmZ09n0VtSmE00MtZQpxn2mgZf7m8yO8whDuMnLQ5opaquo2mA6WSwLvemB5Y--0khSAg_PE5gdewKcuCIeOd0ZGMdmGSBIBj6EHRAcWzM7pVSZmQ6vorJTFn_SCF2YFzd3ufQw7boTg6AA5MxDbFZ8edeORcT4IDnHQKNoZI2lpw3OG5-fh4y-pzry3Vdjzs2Gs8bgyv8ntUbIaZOHLpOvJpjoAoY0xEjDzvv4r8hdrItPbkEQhUlriW08mok70s',
  ],
  'fold-x-sand': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdaYNV1eUHdinTBCip8eTX1E5up7Osgxe3C-twtA8ccBhIjafbZah_xZpoLDYMQRH2B5x3NS36E7ZXaxfAkz8vgMs6Us3UE-eExoun120R-vrLzGIy1hVoKLJHoYcSCHqwT7V_95Yzd8xfJuC6PxRmcMBocnv5Dr3xZwuNNzWctN3d1iHtBCcZHArXVYZi5yy1tTK8_G0yiKWf8kCwwNRcfk2S4upmUoFZUqOntT3xWQvoZ6Ln2ydO9XzrwtwzZkyXZ6-qVYfoyBQ',
  ],
  'fold-x-shadow': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhz4bYPA9AS1yUfUFW50Px4lR8__UFYex1L3FwKkDWrYivVJp4vlJKR3pE0fV6L8GFZAtWbbnut9db9EEtvMftfiH8wIzKhl8Y8l0mLH_XBBvBbmrhYwekzSVX1zg5DTf9GercyPkuJHs0FmFTtyYglAIx0QGk_nnSpQLPB2BtlfyAB4pC1EySQbkUc430_n6rPesGbDRDjw8iol3SMsVVn6SllQsdGDoJBI0rKadjVCadXeRBwAR6ywA45r703EDfflF5w1p7B-I',
  ],
  'studio-speaker-graphite': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAr0PSb1KLCuZQWtyIdIHsCJgF0LPw6_oO3R-3M6kUPK-WvFB6OBYAWZ7iSIuiXg-5h4XyqsGtwt5N1RW7eRLpIFAYDTIfwmC5yE8zI0r2xx04JxETp4B9u8bLF7W8c3_uHnEytYI19OE5j-9myJa8BoiAZ6lwrHkj2-kIVJYaZPmyD6KOP7-Dksq2cJDB9EKb6RaKwCN8ZcUJy3h7z9evmUuIPwlPKU8GcE-BByg2r-NJF02V4ku1fGk93k32zLAaxekbcOwVNZSA',
  ],
  'creator-book-starlight': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB0sB7rHh3aLZFeIPiNxAX3dm7m9RslT7jYDmDFpL6X2v4kqeqKdPwoXzrwLxBaWvSdq9KCoY4Y5S2mCXrBLQ9WBVxe9mVLxX2Sb1IQ0Aue3_4yP1pHjfgk9xoXFJWzquA1tbpn3w4q2LOs8bA5vVpVFJjN_-QQhzJS8D5-u8s4S1kcLM4lC5MiQYV3XuAIajEb0KHiJtGTlqLOjJegRgsrZlhsJGi5YscAd2a4cYau51JnSKvC0P0LEd4SavjRQOH5tTLELKjFkzY',
  ],
}

const fallbackImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBaHroUbRHeYqrDE5ExScaY_lyaRFG5Dh8y6V9K6AOWjItPbRLIfLbFziTtD4KNpTV89NlFJGAIhkdncRBBCwWMBZKJLKhiQPhAY8jO3jLEylECsRpdV0VcSEjR_jL_neZW4h4s7NYa-dY_yiezseFVpFKk62pb8Rz7hvBbizszSmN71oDQ5dXKcIxz00Ff7AO7GtI_knWr4U950LHMS2g8mS1b3QxOvnPUN3AzCdupmqS6Kud26P1XU-jtDhbtxdj1T5Gi9bNtKcw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDqjJPPH-umXdy1P87ESFAr0yMknK3JNGdqExGxjNivfeiu0Vx_YJK8yy3t5B6yxfdzW7_U-ZhRKUUBFsIrMUwWE8lErqL68pdGjsR1LjEOKZzQWSHn3t7ckdvjQD6Iv0y6P6nYlU35x103DJFFsXEMNc0rpST9l0GAWzWPGOcuPzXMa_ApE2uBzftCqVw8c0fR2TF97KqIq1mcXbxLTB0SWKtGg940IBJX1Av7qOLtJ-bN3iCrevel0SX63ngnYzHvTZ8xaiylVUw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_dTyjtX7L82ytQpEYPu3aqKaTWE96-Kesbraq7O3ioD_OaXy6UOQvTHFtCEtzzO_BLvtnXkBqhu2GOUNE8mrzgiOFq7ihKaBB-h1yoQba8u-oqsyX9CA43WMmaZ1BiNtrNcg0TkProeIcOP_hK4up15O8O4bf0Vi_k21tBn7du_wSzxGKdVuMMnheu2Z1PruY6-lCkIa1u7_15Cbltdk8OUV95YjeljXTmObrBkaUj1XL0ZQA2uwRS9CO4xMQNx7eoPlkNIM0V1o',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDtDfYfjmVrI-Nty3B77DvhzvnE9NUZBqC08xNavzgMD78adXv4uAyT2wO_Fi2SVfEgBC9PyUKdP03cUJ-0iNJhG-CUnQzD1V5ePiBSsriNpLqMr-whXLc-Tz8rXrifGJyutZFOrDuJJPAebVC69XVZRrIBbpYE-uA_r2YTNz67mFcUNy10Yxahn7WoWhwBtW_SpEM5r8Pw4AGwL_Wbmv354H1GegJprAiXP-8Vguw2S1uMaqaIMwP_y-SToUp5zpCLmv1dveg80m4',
]

export interface VisualTheme {
  kind: 'phone' | 'audio' | 'laptop' | 'watch' | 'speaker'
  label: string
  primary: string
  secondary: string
  glow: string
  ink: string
}

const visualThemeMap: Record<string, VisualTheme> = {
  'iphone-16-black': {
    kind: 'phone',
    label: '曜石黑',
    primary: '#202730',
    secondary: '#4e6073',
    glow: '#e8a76f',
    ink: '#f8f4ee',
  },
  'airpods-pro-2': {
    kind: 'audio',
    label: '沉浸声场',
    primary: '#eef3f2',
    secondary: '#9babaf',
    glow: '#7fc1b1',
    ink: '#162127',
  },
  'macbook-air-silver': {
    kind: 'laptop',
    label: '银色工作室',
    primary: '#edf2f4',
    secondary: '#93a5b1',
    glow: '#9dcfe4',
    ink: '#1f2d38',
  },
  'watch-series-10-midnight': {
    kind: 'watch',
    label: '午夜腕表',
    primary: '#1f252d',
    secondary: '#596978',
    glow: '#6ebaca',
    ink: '#f4f8fb',
  },
  'homepod-mini-duo': {
    kind: 'speaker',
    label: '全屋声场',
    primary: '#29323a',
    secondary: '#667480',
    glow: '#89d1d3',
    ink: '#f5f8fa',
  },
}

const fallbackTheme: VisualTheme = {
  kind: 'phone',
  label: '精选系列',
  primary: '#28323a',
  secondary: '#6a7f88',
  glow: '#e5a56f',
  ink: '#f6f2eb',
}

export function translateCategoryName(categoryName?: string) {
  if (!categoryName) {
    return '精选'
  }

  return categoryLabels[categoryName] ?? categoryName
}

function resolveImageCandidates(imageKey?: string) {
  if (!imageKey) {
    return fallbackImages
  }

  return productImageMap[imageKey] ?? [imageKey]
}

export function getProductImage(imageKey?: string, index = 0) {
  const candidates = resolveImageCandidates(imageKey)
  return resolveStaticAsset(candidates[index % candidates.length])
}

export function getProductGallery(imageKey?: string) {
  const candidates = resolveImageCandidates(imageKey)
  if (candidates.length >= 4) {
    return candidates.slice(0, 4).map((item) => resolveStaticAsset(item))
  }

  return [...candidates, ...fallbackImages].slice(0, 4).map((item) => resolveStaticAsset(item))
}

export function getVisualTheme(imageKey?: string) {
  if (!imageKey) {
    return fallbackTheme
  }

  return visualThemeMap[imageKey] ?? fallbackTheme
}
