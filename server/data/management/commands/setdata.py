from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Puts directory name, file identifer in .env file"

    def add_arguments(self, parser):
        parser.add_argument("DIRECTORY_NAME", help="Name of the directory with input files")
        #parser.add_argument("FILE_IDENTIFIER", help="Common identifier across input files")

    def handle(self, *args, **options):
        with open("server/.env", "w") as f:
            f.write("DIRECTORY_NAME="+options["DIRECTORY_NAME"]+"\n")
            #f.write("FILE_IDENTIFIER="+options["FILE_IDENTIFIER"])
            f.close()
        self.stdout.write("Saved: "+options["DIRECTORY_NAME"]) #+", "+options["FILE_IDENTIFIER"])
