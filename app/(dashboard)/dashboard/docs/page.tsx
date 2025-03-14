import { Documentation } from "@/components/docs/documentation";

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Documentation</h1>
      <Documentation sections={sections} />
    </div>
  );
}

const sections = [
  {
    id: "create-edit-scraper",
    title: "How to create or edit a scraper",
    content: (
      <ul className="list-disc pl-6 space-y-4">
        <li>
          To create a scraper, you need to make sure the page is connected to
          the backend, for that, you can check if the green button on the top of
          the sidebar is enabled. If you are not connected to the backend, it
          could be for different reasons: The first one is that the backend is
          stopped, in which case you should notify Gonzalo. Other reason for the
          server to be blocked is that it is currently scraping all the
          products, in which case, you will have to wait until the scraping is
          done. The scheduled times at where this process begins are: hour: [6,
          12, 18, 0], minute: 0. Scraping takes around 10 minutes.
        </li>
        <li>
          Once you have done this, you can start creating a scraper. Navigate to
          the URL of the product in a incognito window. If you access from your
          account, it is likely that you will skip some events in the page, such
          as the appearance of a cookie banner. The incognito window must be in
          full screen mode, since all the scrapers will be run in full-screen to
          avoid elements changing due to responsiveness. You can open the
          terminal in the browser, and make sure that the terminal is open in a
          separate window, so that it doesn&apos;t affect the size of the
          window. You can do that by cliking on the three dots on the top right
          of the inspector tab, and then click on &quot;undock into separate
          window&quot;.
        </li>
        <li>
          Now you have the browser in the optimal settings, you can start
          selecting the xpath of the elements that need to be clicked, or
          selected in order to get the price of a product. Use the
          &apos;Select&apos; type of action for the final text to be extracted.
        </li>
        <li>
          When the scraper has been configured correctly, you will get the
          scraped price on your screen. At that point, you can save the product,
          and next time all products are scraped, the new price will be updated.
          If you have done a quick fix, and you want to have the new price be
          pushed to the giergigroeien page as soon as possible, you can edit the
          price of the product manually to match the correct price, and then, on
          the scrape and push tab, press push to wordpress.
        </li>
      </ul>
    ),
  },
  {
    id: "exceptions",
    title: "Exceptions",
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold mb-2">
            The price contains also the decimals
          </h3>
          <p>
            If you are trying to grab the price of an element, but when you
            select the numeral part of the digit you get the decimals attached
            to that number, go deeper in the page html until you get to the
            actual text, and then, select that xpath instead of that of the
            parent element.
          </p>
        </div>
        <div>
          <h3 className="font-bold mb-2">
            The price update is delayed after selecting or clicking on page
            option
          </h3>
          <p>
            Add a &quot;Wait&quot; action before selecting the product price
          </p>
        </div>
        <div>
          <h3 className="font-bold mb-2">The price is not updating</h3>
          <p>If you have tried and nothing worked, contact Gonzalo</p>
        </div>
      </div>
    ),
  },
  {
    id: "scraper-actions",
    title: "Scraper Actions",
    content: (
      <div className="space-y-4">
        <p>
          The scraper supports several types of actions that can be used to
          navigate and extract data from web pages. Here are the available
          action types:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Click</h3>
            <p>
              Use this action to click on elements like buttons, links, or any
              clickable element on the page. Provide the XPath or CSS selector
              of the element you want to click.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Select</h3>
            <p>
              Use this action to extract text from an element. This is typically
              used as the final action to get the price. Provide the XPath or
              CSS selector of the element containing the price.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Select Option</h3>
            <p>
              Use this action to select an option from a dropdown menu. Provide
              the XPath or CSS selector of the dropdown element, and specify the
              option text in the &quot;Option Text&quot; field.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: (
      <div className="space-y-4">
        <p>
          If you encounter issues with the scraper, here are some common
          problems and their solutions:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">
              Scraper fails with &quot;Element not found&quot;
            </h3>
            <p>
              This usually means the XPath or CSS selector is incorrect or the
              element is not present on the page. Double-check your selector and
              make sure the element is visible on the page.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Scraper times out</h3>
            <p>
              This can happen if the page takes too long to load or if an action
              takes too long to complete. Try adding a &quot;Wait&quot; action
              before the problematic action.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Price is not extracted correctly</h3>
            <p>
              Make sure you&apos;re selecting the exact element that contains
              the price. Sometimes, you may need to select a child element to
              get just the price without any additional text.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];
