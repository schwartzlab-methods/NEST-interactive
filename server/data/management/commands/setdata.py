from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = ""

    def add_arguments(self, parser):
        parser.add_argument("DIRECTORYNAME", help="")
        parser.add_argument("FILENAME", help="")

    def handle(self, *args, **options):
        with open(".env", "w") as f:
            f.write("DIRECTORYNAME="+options["DIRECTORYNAME"]+"\n")
            f.write("FILENAME="+options["FILENAME"])
            f.close()
        self.stdout.write("Saved: "+options["DIRECTORYNAME"]+", "+options["FILENAME"])
