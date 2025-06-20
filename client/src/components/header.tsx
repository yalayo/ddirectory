import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">
                D Directory
              </h1>
            </Link>
            <nav className="hidden md:ml-8 md:flex space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Find Pros
              </Link>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Ideas</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Reviews</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search professionals"
                  className="w-72 pl-10"
                />
              </div>
            </div>
            <Button className="btn-primary">
              Join as Pro
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
