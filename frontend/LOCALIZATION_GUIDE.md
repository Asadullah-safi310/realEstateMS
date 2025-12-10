# Localization Implementation Guide

## Overview
Your Real Estate PMS application is now set up for multi-language support with **English**, **Dari**, and **Pashto**.

## What's Been Done ✅

### 1. **Translation Infrastructure**
- ✅ Created `/src/i18n/i18n.js` - Core translation system
- ✅ Created `/src/i18n/translations/` folder with:
  - `en.json` - English translations
  - `dari.json` - Dari translations
  - `pashto.json` - Pashto translations
- ✅ Created `/src/hooks/useTranslation.js` - React hook for translations
- ✅ Created `/src/components/LanguageSelector.jsx` - Language switcher UI

### 2. **Updated Components**
- ✅ **MainLayout.jsx** - Navigation translated + language selector integrated
- ✅ **PropertyList.jsx** - Started translation updates

### 3. **Features**
- Multi-language support (English, Dari, Pashto)
- Language persistence in localStorage
- Language change event system for real-time UI updates
- Simple API: `const { t } = useTranslation(); t('key.path')`

---

## How to Use Translations

### In Any Component:

```jsx
import useTranslation from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('properties.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### Translation File Structure:
Translations are organized by feature:
```json
{
  "common": { ... },
  "properties": { ... },
  "owners": { ... },
  "clients": { ... },
  "deals": { ... }
}
```

---

## Pages That Need Translation Updates

### Priority 1 (Core Pages):
1. **AddProperty.jsx** - Form labels and messages
2. **AddOwner.jsx** - Form labels and messages
3. **AddClient.jsx** - Form labels and messages
4. **AddDeal.jsx** - Form labels and messages
5. **OwnerList.jsx** - Table headers, buttons
6. **ClientList.jsx** - Table headers, buttons
7. **DealList.jsx** - Table headers, buttons

### Priority 2 (Additional Pages):
1. **Dashboard.jsx** - If exists
2. **SearchProperties.jsx** - Search form labels
3. **Settings.jsx** - Settings page content

---

## Quick Update Template

For each component, follow this pattern:

### Step 1: Add Import
```jsx
import useTranslation from '../hooks/useTranslation';
```

### Step 2: Use Hook
```jsx
const { t } = useTranslation();
```

### Step 3: Replace Hardcoded Text
```jsx
// Before:
<h1>Add Property</h1>

// After:
<h1>{t('properties.addProperty')}</h1>
```

---

## Common Translation Keys

### Properties
- `properties.title` - "Properties"
- `properties.addProperty` - "Add Property"
- `properties.editProperty` - "Edit Property"
- `properties.price` - "Price"
- `properties.location` - "Location"
- `properties.city` - "City"
- `properties.bedrooms` - "Bedrooms"
- `properties.bathrooms` - "Bathrooms"
- `properties.propertyCreated` - "Property created successfully"
- `properties.propertyDeleted` - "Property deleted successfully"

### Owners
- `owners.title` - "Owners"
- `owners.addOwner` - "Add Owner"
- `owners.name` - "Owner Name"
- `owners.phone` - "Phone"

### Clients
- `clients.title` - "Clients"
- `clients.addClient` - "Add Client"
- `clients.name` - "Client Name"

### Deals
- `deals.title` - "Deals"
- `deals.addDeal` - "Add Deal"

### Common
- `common.loading` - "Loading..."
- `common.create` - "Create"
- `common.update` - "Update"
- `common.delete` - "Delete"
- `common.cancel` - "Cancel"
- `common.save` - "Save"

---

## Example: Translating AddProperty.jsx

```jsx
// Add import at top
import useTranslation from '../hooks/useTranslation';

const AddProperty = () => {
  // ... existing code ...
  const { t } = useTranslation();
  
  // In the handleSubmit function:
  if (success) {
    showSuccess(id ? t('properties.propertyUpdated') : t('properties.propertyCreated'));
    navigate('/properties');
  } else {
    showError('Error: ' + PropertyStore.error);
  }
  
  // In the render/return:
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {id ? t('properties.editProperty') : t('properties.addProperty')}
        </h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik>
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {t('properties.owner')}
                  </label>
                  {/* ... rest of field ... */}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {t('properties.type')}
                  </label>
                  {/* ... rest of field ... */}
                </div>
                
                {/* Continue for all fields... */}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddProperty;
```

---

## Adding New Translation Keys

If you need a translation that doesn't exist:

1. **Add to all three translation files:**

**en.json:**
```json
"newFeature": {
  "title": "New Feature",
  "description": "Description here"
}
```

**dari.json:**
```json
"newFeature": {
  "title": "ویژگی جدید",
  "description": "توضیح در اینجا"
}
```

**pashto.json:**
```json
"newFeature": {
  "title": "نوی ویژگی",
  "description": "توضیح دلته"
}
```

2. **Use in component:**
```jsx
const { t } = useTranslation();
<h1>{t('newFeature.title')}</h1>
```

---

## Switching Languages at Runtime

The LanguageSelector component in the sidebar allows users to switch languages. The language preference is automatically saved to localStorage and persists across sessions.

```jsx
// Manually set language programmatically:
const { setLanguage } = useTranslation();
setLanguage('dari'); // Switch to Dari
setLanguage('pashto'); // Switch to Pashto
setLanguage('en'); // Switch to English
```

---

## Testing Translations

1. **Launch the app**
2. **Use the language selector** in the sidebar (bottom)
3. **Verify all text changes** for each language
4. **Refresh the page** - language preference should persist

---

## Troubleshooting

### Translation key returns key name instead of text
- **Problem:** Text shows "properties.title" instead of "Properties"
- **Solution:** Check the key path is correct in the translation file
- Check spelling (keys are case-sensitive)

### Language doesn't change
- **Problem:** Selecting language doesn't update UI
- **Solution:** Make sure component uses `useTranslation()` hook
- Components must re-render when language changes
- Check browser console for errors

### Missing translation in a language
- **Problem:** Dari translation shows English text
- **Solution:** Add the missing key to dari.json
- All three language files must have all keys

---

## Next Steps

1. Update all page components using the template above
2. Test all languages in each page
3. Add any missing translation keys
4. Deploy with full multi-language support!

---

## Summary of Key Files

| File | Purpose |
|------|---------|
| `/src/i18n/i18n.js` | Core translation engine |
| `/src/i18n/translations/en.json` | English text |
| `/src/i18n/translations/dari.json` | Dari text |
| `/src/i18n/translations/pashto.json` | Pashto text |
| `/src/hooks/useTranslation.js` | React hook for translations |
| `/src/components/LanguageSelector.jsx` | Language switcher UI |
| `/src/layouts/MainLayout.jsx` | Updated with translations |

