export const extractClientCompanyFromHtml = (html: string): string => {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Define a list of selectors to try in order of preference
    const selectors = [
      () => { // For Invoice: The element after "BILL TO"
        const billToElement = Array.from(tempDiv.querySelectorAll('p, strong')).find(p => p.textContent?.trim().toUpperCase() === 'BILL TO');
        return billToElement?.nextElementSibling?.textContent?.trim();
      },
      () => { // For Quote: The element after "To:"
        const toElement = Array.from(tempDiv.querySelectorAll('strong')).find(p => p.textContent?.trim().includes('To:'));
        return toElement?.nextElementSibling?.textContent?.trim();
      },
      () => { // For SLA: The element after "Client:"
        const clientElement = Array.from(tempDiv.querySelectorAll('strong')).find(p => p.textContent?.trim().includes('Client:'));
        return clientElement?.nextElementSibling?.textContent?.trim();
      },
      () => { // Fallback for [[Client Company]] placeholder
        const placeholderText = '[[Client Company]]';
        const element = Array.from(tempDiv.querySelectorAll('[contenteditable="true"]')).find(el => el.textContent?.includes(placeholderText));
        return element ? placeholderText : undefined;
      }
    ];

    for (const selector of selectors) {
      const result = selector();
      if (result) {
        return result;
      }
    }

  } catch (e) {
    console.error("Error parsing HTML for client company:", e);
  }

  return 'Unknown Client';
};
