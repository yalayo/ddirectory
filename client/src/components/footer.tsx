export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">D Directory</h3>
            <p className="text-gray-400 text-sm">
              Connecting homeowners with trusted contractors in Lake Charles and surrounding areas.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">For Homeowners</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Find Contractors</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Get Estimates</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Read Reviews</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">For Professionals</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Join Directory</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Resources</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Lake Charles, LA</li>
              <li>support@ddirectory.com</li>
              <li>(337) 555-0123</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2024 D Directory. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
